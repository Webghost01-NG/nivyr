import { spawnSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = resolve(process.env.NIVYR_BOOTSTRAP_ROOT ?? `${root}/.cache/runtime/nivyr-bootstrap`);
const statePath = resolve(runtimeRoot, "state.json");
const environment = { ...process.env };

async function managedState(): Promise<{
  devtoolPath: string;
  runtimeRoot: string;
  activationHeights: string;
  senderWallet: string;
  senderIdentity: string;
  ready?: boolean;
  schema?: number;
  project?: string;
  z3Commit?: string;
}> {
  let source: string;
  try {
    source = await readFile(statePath, "utf8");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    const required = ["NIVYR_DEVTOOL", "NIVYR_RUNTIME_ROOT", "NIVYR_ACTIVATION_HEIGHTS", "NIVYR_SENDER_WALLET", "NIVYR_SENDER_IDENTITY"];
    const missing = required.filter((name) => !environment[name]);
    if (missing.length === 0) {
      return {
        devtoolPath: environment.NIVYR_DEVTOOL!,
        runtimeRoot: environment.NIVYR_RUNTIME_ROOT!,
        activationHeights: environment.NIVYR_ACTIVATION_HEIGHTS!,
        senderWallet: environment.NIVYR_SENDER_WALLET!,
        senderIdentity: environment.NIVYR_SENDER_IDENTITY!,
      };
    }
    if (!existsSync(runtimeRoot)) {
      throw new Error(`No Nivyr managed runtime exists yet. Bootstrap did not complete or has not been run. Run npm run nivyr:up successfully first. If bootstrap failed during source download/build, its cache is preserved; fix that reported error and retry. Missing integration settings: ${missing.join(", ")}.`);
    }
    throw new Error(`Nivyr runtime data exists, but its bootstrap state is missing or incomplete. Do not delete .cache yet; inspect the original nivyr:up error, then retry npm run nivyr:up to resume. Missing integration settings: ${missing.join(", ")}.`);
  }
  let state: ReturnType<typeof JSON.parse>;
  try {
    state = JSON.parse(source);
  } catch {
    throw new Error("Nivyr bootstrap state exists but is not valid JSON. Preserve .cache/runtime/nivyr-bootstrap for diagnosis; rerun npm run nivyr:up after inspecting the file.");
  }
  const keys = ["devtoolPath", "runtimeRoot", "activationHeights", "senderWallet", "senderIdentity"];
  const missing = keys.filter((key) => typeof state[key] !== "string" || state[key].length === 0);
  if (missing.length) throw new Error(`Nivyr bootstrap state is incomplete (missing ${missing.join(", ")}). Preserve runtime data and rerun npm run nivyr:up to repair it.`);
  const expectedProject = environment.NIVYR_COMPOSE_PROJECT ?? "nivyr-zcash-regtest";
  if (state.schema !== 1 || state.project !== expectedProject
    || state.z3Commit !== "e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb") {
    throw new Error("Nivyr bootstrap state has an unsupported schema, project, or Z3 pin. Preserve runtime data and rerun npm run nivyr:up with the matching checkout.");
  }
  if (resolve(state.runtimeRoot) !== runtimeRoot) {
    throw new Error("Nivyr bootstrap state refers to a different runtime root than the selected bootstrap directory. Set NIVYR_BOOTSTRAP_ROOT consistently or rerun npm run nivyr:up.");
  }
  if (typeof state.ready !== "boolean") {
    throw new Error("Nivyr bootstrap state has no valid READY marker. Preserve runtime data and rerun npm run nivyr:up to validate/resume it.");
  }
  const missingPaths = keys.filter((key) => key !== "runtimeRoot" && !existsSync(state[key]));
  if (missingPaths.length) throw new Error(`Nivyr bootstrap state points to missing local runtime inputs (${missingPaths.join(", ")}). Preserve .cache and rerun npm run nivyr:up to repair the runtime.`);
  return state;
}

async function assertManagedServicesReady(): Promise<void> {
  const probes = [
    { name: "Zebra", url: environment.NIVYR_ZEBRA_RPC_URL!, auth: true },
    { name: "Zaino", url: environment.NIVYR_ZAINO_RPC_URL!, auth: false },
  ];
  for (const service of probes) {
    try {
      const response = await fetch(service.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(service.auth ? { authorization: `Basic ${Buffer.from("zebra:zebra").toString("base64")}` } : {}),
        },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getblockcount", params: [] }),
        signal: AbortSignal.timeout(2_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { result?: unknown; error?: unknown };
      if (typeof payload.result !== "number" || payload.error) throw new Error("JSON-RPC returned no numeric chain height");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Nivyr runtime is configured READY, but ${service.name} is not responding at its configured local endpoint (${detail}). Run npm run nivyr:up to start or repair the owned stack, then rerun integration tests.`);
    }
  }
}

async function runIntegration(): Promise<void> {
  const state = await managedState();
  if (state.ready === false) {
    throw new Error("Nivyr bootstrap state exists but has not reached READY. Preserve its partial state and rerun npm run nivyr:up to resume before running integration tests.");
  }
  environment.NIVYR_DEVTOOL ??= state.devtoolPath;
  environment.NIVYR_RUNTIME_ROOT ??= state.runtimeRoot;
  environment.NIVYR_ACTIVATION_HEIGHTS ??= state.activationHeights;
  environment.NIVYR_SENDER_WALLET ??= state.senderWallet;
  environment.NIVYR_SENDER_IDENTITY ??= state.senderIdentity;
  environment.NIVYR_ZEBRA_RPC_URL ??= "http://127.0.0.1:49232";
  environment.NIVYR_ZAINO_RPC_URL ??= "http://127.0.0.1:49237";
  environment.NIVYR_LIGHTWALLETD_ADDRESS ??= "127.0.0.1:49137";
  if (state.schema !== undefined) await assertManagedServicesReady();

  const evidenceRun = new Date().toISOString().replaceAll(":", "-");
  const evidenceDir = environment.NIVYR_EVIDENCE_DIR ?? resolve(root, "docs/evidence/bootstrap/integration", evidenceRun);
  environment.NIVYR_EVIDENCE_DIR = evidenceDir;
  await mkdir(evidenceDir, { recursive: true });

  const vitest = resolve(root, "node_modules/vitest/vitest.mjs");
  const result = spawnSync(process.execPath, [vitest, "run", "--config", "vitest.integration.config.ts"], {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

runIntegration().catch((error: unknown) => {
  process.stderr.write(`[nivyr] ERROR: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
