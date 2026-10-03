#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const supportedNode = /^v(?:22\.(?:1[2-9]|[2-9]\d|\d{3,})|24\.|(?:2[6-9]|[3-9]\d)\.)/.test(process.version);
const projectRoot = process.cwd();
const runtimeRoot = resolve(process.env.NIVYR_RUNTIME_ROOT ?? join(projectRoot, ".nivyr"));
const ports = [49232, 49080, 49137, 49237];
const composeProject = process.env.NIVYR_COMPOSE_PROJECT ?? `nivyr-${createHash("sha256").update(projectRoot).digest("hex").slice(0, 16)}`;
const packageRootCandidate = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const packageRoot = resolve(packageRootCandidate, existsSync(join(packageRootCandidate, "package.json")) ? "." : "..");
const devtoolImage = process.env.NIVYR_DEVTOOL_IMAGE ?? "ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9";
const walletCommit = "5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8";
const activationHeightsPath = join(packageRoot, "config", "regtest-activation-heights.toml");
type Check = { label: string; ok: boolean; detail: string; required?: boolean };

function command(executable: string, args: string[], timeout = 10_000): { ok: boolean; output: string } {
  const result = spawnSync(executable, args, { encoding: "utf8", timeout, windowsHide: true });
  if (result.error) return { ok: false, output: result.error.message };
  return { ok: result.status === 0, output: (result.stdout || result.stderr || `exit ${result.status}`).trim() };
}

async function portAvailable(port: number): Promise<boolean> {
  return new Promise((resolvePort) => {
    const server = createConnection({ host: "127.0.0.1", port });
    server.setTimeout(250);
    server.once("connect", () => { server.destroy(); resolvePort(false); });
    server.once("timeout", () => { server.destroy(); resolvePort(true); });
    server.once("error", () => resolvePort(true));
  });
}

async function checkRuntimeWriteability(): Promise<Check> {
  try {
    const probe = await mkdtemp(join(projectRoot, ".nivyr-doctor-"));
    await rm(probe, { recursive: true, force: true });
    return { label: "Runtime directory writable", ok: true, detail: runtimeRoot };
  } catch (error) {
    return { label: "Runtime directory writable", ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

async function freeDiskBytes(path: string): Promise<number | undefined> {
  const result = command("df", ["-Pk", path]);
  if (!result.ok) return undefined;
  const line = result.output.split(/\r?\n/).at(-1)?.trim().split(/\s+/);
  const availableKiB = Number(line?.[3]);
  return Number.isFinite(availableKiB) ? availableKiB * 1024 : undefined;
}

async function doctor(): Promise<boolean> {
  const archSupported = process.arch === "x64";
  const checks: Check[] = [
    { label: "Operating system", ok: process.platform === "linux" || process.platform === "darwin", detail: `${process.platform} ${process.arch}` },
    { label: "Architecture", ok: archSupported, detail: process.arch === "arm64" ? "only linux/amd64 devtool image is supported; ARM64 is unsupported pending an ARM64 image" : `${process.arch}; devtool image is linux/amd64` },
    { label: "Node.js", ok: supportedNode, detail: `${process.version} (requires ^22.12.0, ^24, or >=26)` },
  ];
  const npm = command("npm", ["--version"]);
  checks.push({ label: "npm", ok: npm.ok, detail: npm.output });
  const docker = command("docker", ["--version"]);
  checks.push({ label: "Docker CLI", ok: docker.ok, detail: docker.ok ? docker.output : "Docker was not found in PATH. Install Docker, then verify: docker --version; docker compose version; docker info" });
  if (docker.ok) {
    const daemon = command("docker", ["info", "--format", "{{.ServerVersion}}"], 20_000);
    checks.push({ label: "Docker daemon", ok: daemon.ok, detail: daemon.ok ? `server ${daemon.output}` : "Docker CLI is installed, but the daemon is unavailable. Start Docker and verify with: docker info" });
    const compose = command("docker", ["compose", "version", "--short"]);
    checks.push({ label: "Docker Compose", ok: compose.ok, detail: compose.output });
  } else {
    checks.push({ label: "Docker daemon", ok: false, detail: "Not checked because Docker CLI is unavailable" });
    checks.push({ label: "Docker Compose", ok: false, detail: "Not checked because Docker CLI is unavailable" });
  }
  const existingOwned = docker.ok ? command("docker", ["ps", "-aq", "--filter", `label=com.docker.compose.project=${composeProject}`]).output : "";
  const busy = existingOwned ? [] : (await Promise.all(ports.map(async (port) => await portAvailable(port) ? null : port))).filter((port): port is number => port !== null);
  checks.push({ label: "Required ports available", ok: busy.length === 0, detail: existingOwned ? `Nivyr project ${composeProject} already owns its runtime ports` : busy.length ? `Busy: ${busy.join(", ")}` : `${ports.join(", ")}` });
  checks.push(await checkRuntimeWriteability());
  const projectDisk = await freeDiskBytes(projectRoot);
  const dockerRoot = docker.ok ? command("docker", ["info", "--format", "{{.DockerRootDir}}"], 20_000).output : "";
  const dockerDisk = dockerRoot ? await freeDiskBytes(dockerRoot) : undefined;
  const disk = Math.min(projectDisk ?? Number.POSITIVE_INFINITY, dockerDisk ?? Number.POSITIVE_INFINITY);
  const diskText = Number.isFinite(disk) ? `${(disk / 1024 ** 3).toFixed(1)} GiB minimum available across project and Docker storage; 8 GiB recommended` : "could not determine project and Docker available bytes";
  checks.push({ label: "Free disk", ok: Number.isFinite(disk) && disk >= 8 * 1024 ** 3, detail: diskText, required: false });
  const registries = await Promise.all(["https://index.docker.io/v2/", "https://ghcr.io/v2/"].map((url) => fetch(url, { signal: AbortSignal.timeout(4_000) }).then((response) => response.status === 401 || response.ok).catch(() => false)));
  const registry = registries.every(Boolean);
  checks.push({ label: "Image pull network", ok: registry, detail: registry ? "Docker Hub and GHCR registry endpoints reachable" : `Registry reachability: Docker Hub ${registries[0] ? "yes" : "no"}, GHCR ${registries[1] ? "yes" : "no"}; image pulls may fail`, required: false });
  checks.push({ label: "Image architecture", ok: archSupported, detail: archSupported ? "linux/amd64" : `host ${process.arch}; only linux/amd64 is planned` });

  process.stdout.write("Nivyr Doctor\n\n");
  for (const check of checks) process.stdout.write(`${check.ok ? "✓" : check.required === false ? "!" : "✗"} ${check.label}: ${check.detail}\n`);
  const ready = checks.every((check) => check.ok || check.required === false);
  if (ready) process.stdout.write("\nReady to run:\n\nnpx nivyr up\n");
  else process.stderr.write("\nResolve the failed host checks, then rerun npx nivyr doctor. No runtime was started.\n");
  return ready;
}

async function packageUp(): Promise<void> {
  if (!await doctor()) { process.exitCode = 1; return; }
  if (!/@sha256:[a-f0-9]{64}$/.test(devtoolImage)) {
    throw new Error("The pinned zcash-devtool image has not been published with an immutable digest. No runtime state was created and no images were pulled. Maintainers must publish the trusted image workflow, record its digest, then release a package configured with that digest.");
  }
  const script = join(packageRoot, "dist", "scripts", "nivyr.js");
  const result = spawnSync(process.execPath, [script, "up"], {
    cwd: projectRoot,
    env: { ...process.env, NIVYR_PROJECT_ROOT: projectRoot, NIVYR_PACKAGE_ROOT: packageRoot, NIVYR_BOOTSTRAP_ROOT: runtimeRoot, NIVYR_COMPOSE_PROJECT: composeProject, NIVYR_DEVTOOL_MODE: "image", NIVYR_DEVTOOL_IMAGE: devtoolImage },
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) throw new Error(`Package bootstrap could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Package bootstrap exited with status ${result.status}`);
}

async function runExistingOrExplain(action: "up" | "down" | "test"): Promise<void> {
  if (action === "up") {
    await packageUp();
    return;
  }
  if (action === "down") {
    const script = join(packageRoot, "dist", "scripts", "nivyr.js");
    const result = spawnSync(process.execPath, [script, "down"], { cwd: projectRoot, env: { ...process.env, NIVYR_PROJECT_ROOT: projectRoot, NIVYR_PACKAGE_ROOT: packageRoot, NIVYR_BOOTSTRAP_ROOT: runtimeRoot, NIVYR_COMPOSE_PROJECT: composeProject, NIVYR_DEVTOOL_MODE: "image", NIVYR_DEVTOOL_IMAGE: devtoolImage }, stdio: "inherit", windowsHide: true });
    if (result.error) throw new Error(`Package shutdown could not start: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`Package shutdown exited with status ${result.status}`);
    return;
  }
  const script = join(packageRoot, "dist", "src", "cli", "lifecycle.js");
  const result = spawnSync(process.execPath, [script], { cwd: projectRoot, env: { ...process.env, NIVYR_RUNTIME_ROOT: runtimeRoot, NIVYR_PACKAGE_ROOT: packageRoot, NIVYR_DEVTOOL_MODE: "image", NIVYR_DEVTOOL_IMAGE: devtoolImage }, stdio: "inherit", windowsHide: true });
  if (result.error) throw new Error(`Packaged lifecycle verification could not start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Packaged lifecycle verification exited with status ${result.status}`);
}

async function main(): Promise<void> {
  const action = process.argv[2];
  if (action === "doctor") {
    if (!await doctor()) process.exitCode = 1;
    return;
  }
  if (action === "up" || action === "down" || action === "test") {
    await runExistingOrExplain(action);
    return;
  }
  process.stdout.write("Usage: nivyr <doctor|up|test|down>\n");
  process.exitCode = action ? 2 : 0;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[nivyr] ERROR: ${message}\n`);
  process.exitCode = 1;
});
