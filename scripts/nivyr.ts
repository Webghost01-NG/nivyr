import { spawnSync } from "node:child_process";
import { mkdirSync as createDirectorySync, existsSync, writeFileSync as writeFileSyncNode } from "node:fs";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createConnection } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = join(root, ".cache");
const runtimeRoot = resolve(process.env.NIVYR_BOOTSTRAP_ROOT ?? join(cacheRoot, "runtime", "nivyr-bootstrap"));
const upstreamRoot = join(cacheRoot, "upstream");
const z3Source = join(upstreamRoot, "z3");
const walletSource = join(upstreamRoot, "zcash-devtool");
const z3Runtime = join(runtimeRoot, "z3");
const statePath = join(runtimeRoot, "state.json");
const ownerPath = join(runtimeRoot, ".nivyr-owned");
const composeProject = process.env.NIVYR_COMPOSE_PROJECT ?? "nivyr-zcash-regtest";
const z3Commit = "e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb";
const walletCommit = "5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8";
const zebraImage = "zfnd/zebra:6.2.3@sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2";
const zainoImage = "zingodevops/zainod:0.10.1-no-tls@sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9";
const zalletImage = "zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d";
const defaultMinerAddress = "tmSRd1r8gs77Ja67Fw1JcdoXytxsyrLTPJm";
const ports = {
  zebraRpc: 49232,
  zebraHealth: 49080,
  zainoGrpc: 49137,
  zainoJsonRpc: 49237,
  zalletRpc: 49532,
  router: 49818,
} as const;
const rpcUser = "zebra";
const rpcPassword = "zebra";
const targetSpendableZatoshi = 10_000_000;

interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  input?: string | Buffer;
  timeoutMs?: number;
  allowFailure?: boolean;
  binary?: boolean;
}

interface FundingState {
  startHeight: number;
  controlledTarget: number;
  controlledEndHeight?: number;
  maturityTarget?: number;
}

interface BootstrapState {
  schema: 1;
  project: string;
  z3Commit: string;
  walletCommit: string;
  runtimeRoot: string;
  z3Runtime: string;
  envFile: string;
  devtoolPath: string;
  activationHeights: string;
  senderWallet: string;
  senderIdentity: string;
  senderAddress?: string;
  funding?: FundingState;
  shieldTxid?: string;
  ready?: boolean;
  readyAt?: string;
}

interface JsonRpcResponse<T> {
  result?: T;
  error?: { code: number; message: string };
}

interface RawTx {
  txid: string;
  version: number;
  in_active_chain: boolean;
  height?: number;
  confirmations?: number;
  vin?: readonly unknown[];
  vout?: readonly unknown[];
  vShieldedSpend?: readonly unknown[];
  vShieldedOutput?: readonly unknown[];
  orchard?: { actions?: readonly unknown[] };
  ironwood?: { actions?: readonly unknown[] };
}

interface WalletBalance {
  total: number;
  sapling_spendable: number;
  orchard_spendable: number;
  ironwood_spendable: number;
  transparent_spendable: number;
  chain_tip_height: number;
}

function command(executable: string, args: readonly string[], options: CommandOptions = {}): string | Buffer {
  const result = spawnSync(executable, [...args], {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    input: options.input,
    encoding: options.binary ? null : "utf8",
    timeout: options.timeoutMs ?? 120_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw new Error(`${executable} could not run: ${result.error.message}`);
  if (result.status !== 0 && !options.allowFailure) {
    const stdout = Buffer.isBuffer(result.stdout) ? "" : result.stdout?.trim();
    const stderr = Buffer.isBuffer(result.stderr) ? "" : result.stderr?.trim();
    const detail = (stderr || stdout || `exit ${result.status}`).slice(-3000);
    throw new Error(`${executable} ${args.join(" ")} failed: ${detail}`);
  }
  return result.stdout ?? (options.binary ? Buffer.alloc(0) : "");
}

function commandText(executable: string, args: readonly string[], options: CommandOptions = {}): string {
  const result = command(executable, args, options);
  if (Buffer.isBuffer(result)) throw new Error(`Expected text from ${executable}`);
  return result;
}

function commandBuffer(executable: string, args: readonly string[], options: CommandOptions = {}): Buffer {
  const result = command(executable, args, { ...options, binary: true });
  if (!Buffer.isBuffer(result)) throw new Error(`Expected binary output from ${executable}`);
  return result;
}

function log(message: string): void {
  process.stdout.write(`[nivyr] ${message}\n`);
}

function compose(args: readonly string[], env: NodeJS.ProcessEnv = process.env, allowFailure = false): string {
  const envFile = join(z3Runtime, ".env.regtest");
  return commandText("docker", ["compose", "--env-file", envFile, ...args], {
    cwd: z3Runtime,
    env,
    allowFailure,
  });
}

function ownerMarker(): string {
  return JSON.stringify({ project: composeProject, z3Commit, runtimeRoot }, null, 2) + "\n";
}

async function writeAtomic(path: string, data: string, mode = 0o600): Promise<void> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, data, { mode });
  await chmod(temporary, mode);
  await rename(temporary, path);
}

async function loadState(): Promise<BootstrapState | undefined> {
  try {
    const state = JSON.parse(await readFile(statePath, "utf8")) as BootstrapState;
    if (state.schema !== 1 || state.project !== composeProject || state.z3Commit !== z3Commit) {
      throw new Error(`Bootstrap state at ${statePath} does not match the pinned Nivyr project`);
    }
    return state;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  }
}

async function saveState(state: BootstrapState): Promise<void> {
  await writeAtomic(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function requireCommand(executable: string, args: readonly string[], minimum?: readonly number[]): string {
  const output = commandText(executable, args).trim();
  if (minimum) {
    const version = output.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!version) throw new Error(`Could not parse ${executable} version from: ${output}`);
    const actual = version.slice(1).map(Number);
    for (let i = 0; i < minimum.length; i += 1) {
      if (actual[i] > minimum[i]) break;
      if (actual[i] < minimum[i]) throw new Error(`${executable} ${output} is too old; need ${minimum.join(".")} or newer`);
    }
  }
  return output;
}

function ensurePrerequisites(): void {
  const [major, minor, patch] = process.versions.node.split(".").map(Number);
  const actual = [major, minor, patch];
  const minimum = [22, 23, 1];
  for (let i = 0; i < minimum.length; i += 1) {
    if (actual[i] > minimum[i]) break;
    if (actual[i] < minimum[i]) throw new Error(`Node.js ${process.versions.node} found; Nivyr requires 22.23.1 or newer`);
  }
  requireCommand("git", ["--version"]);
  requireCommand("tar", ["--version"]);
  requireCommand("curl", ["--version"]);
  requireCommand("openssl", ["version"]);
  requireCommand("docker", ["--version"]);
  requireCommand("docker", ["compose", "version", "--short"], [2, 24, 4]);
  commandText("docker", ["info"], { timeoutMs: 20_000 });
}

function ensureGitSource(path: string, remote: string, commit: string): void {
  if (!existsSync(join(path, ".git"))) {
    if (existsSync(path)) throw new Error(`Refusing to replace non-Git cache path ${path}`);
    createDirectorySync(dirname(path), { recursive: true });
    log(`Fetching pinned source ${commit.slice(0, 8)} from ${remote}`);
    commandText("git", ["clone", "--filter=blob:none", "--no-checkout", remote, path], { timeoutMs: 300_000 });
  }
  const result = spawnSync("git", ["-C", path, "cat-file", "-e", `${commit}^{commit}`], { encoding: "utf8" });
  if (result.status !== 0) {
    commandText("git", ["-C", path, "fetch", "--filter=blob:none", "origin", commit], { timeoutMs: 300_000 });
  }
  const verified = commandText("git", ["-C", path, "rev-parse", `${commit}^{commit}`]).trim();
  if (verified !== commit) throw new Error(`Could not verify pinned source commit ${commit} in ${path}`);
}

function extractPinnedArchive(repository: string, commit: string, destination: string): void {
  if (existsSync(destination)) {
    const marker = join(destination, ".nivyr-pin");
    if (!existsSync(marker)) throw new Error(`Refusing to replace unmarked pinned source directory ${destination}`);
    const result = spawnSync("cat", [marker], { encoding: "utf8" });
    if (result.status !== 0 || result.stdout.trim() !== commit) {
      throw new Error(`Pinned source directory ${destination} has a different marker`);
    }
    return;
  }
  createDirectorySync(dirname(destination), { recursive: true, mode: 0o700 });
  createDirectorySync(destination, { recursive: false, mode: 0o700 });
  const archive = commandBuffer("git", ["-C", repository, "archive", "--format=tar", commit]);
  const extracted = spawnSync("tar", ["-xf", "-", "-C", destination], { input: archive, encoding: "utf8" });
  if (extracted.status !== 0) throw new Error(`Could not extract pinned source ${commit}: ${extracted.stderr}`);
  createDirectorySync(join(destination, "target"), { recursive: true, mode: 0o700 });
  writeFileSyncNode(join(destination, ".nivyr-pin"), `${commit}\n`, { mode: 0o600 });
}

async function ensurePinnedSources(): Promise<string> {
  ensureGitSource(z3Source, "https://github.com/ZcashFoundation/z3.git", z3Commit);
  ensureGitSource(walletSource, "https://github.com/zcash/zcash-devtool.git", walletCommit);
  const cachedWalletBinary = join(walletSource, "target", "release", "zcash-devtool");
  let walletBinary = cachedWalletBinary;
  if (!existsSync(cachedWalletBinary)) {
    const walletBuildSource = join(runtimeRoot, "zcash-devtool-source");
    extractPinnedArchive(walletSource, walletCommit, walletBuildSource);
    requireCommand("cargo", ["--version"]);
    log("Building pinned zcash-devtool with regtest_support (first build may take several minutes)");
    commandText("cargo", ["build", "--release", "--locked", "--features", "regtest_support"], {
      cwd: walletBuildSource,
      timeoutMs: 1_800_000,
    });
    walletBinary = join(walletBuildSource, "target", "release", "zcash-devtool");
  }
  if (!existsSync(walletBinary)) throw new Error(`Pinned wallet binary was not produced at ${walletBinary}`);

  const marker = join(z3Runtime, ".nivyr-pin");
  if (existsSync(z3Runtime)) {
    if (!existsSync(marker) || (await readFile(marker, "utf8")).trim() !== z3Commit) {
      throw new Error(`Refusing to reuse unexpected Z3 runtime source at ${z3Runtime}`);
    }
  } else {
    await mkdir(z3Runtime, { recursive: true, mode: 0o700 });
    const archive = commandBuffer("git", ["-C", z3Source, "archive", "--format=tar", z3Commit]);
    const extracted = spawnSync("tar", ["-xf", "-", "-C", z3Runtime], { input: archive, encoding: "utf8" });
    if (extracted.status !== 0) throw new Error(`Could not prepare pinned Z3 runtime source: ${extracted.stderr}`);
    await writeFile(marker, `${z3Commit}\n`, { mode: 0o600 });
  }
  return walletBinary;
}

function envFileContents(): string {
  return [
    `COMPOSE_PROJECT_NAME=${composeProject}`,
    "COMPOSE_FILE=docker-compose.yml:docker-compose.regtest.yml",
    "Z3_NETWORK=Regtest",
    "Z3_CONFIG_DIR=./config/regtest",
    "ZEBRA_RPC__ENABLE_COOKIE_AUTH=false",
    "ZEBRA_HEALTH__MIN_CONNECTED_PEERS=0",
    `ZEBRA_MINING__MINER_ADDRESS=${defaultMinerAddress}`,
    "Z3_ZEBRA_RPC_PORT=18232",
    `Z3_ZEBRA_HOST_RPC_PORT=${ports.zebraRpc}`,
    `Z3_ZEBRA_HOST_HEALTH_PORT=${ports.zebraHealth}`,
    `Z3_ZAINO_HOST_GRPC_PORT=${ports.zainoGrpc}`,
    `Z3_ZAINO_HOST_JSON_RPC_PORT=${ports.zainoJsonRpc}`,
    `Z3_ZALLET_HOST_RPC_PORT=${ports.zalletRpc}`,
    `Z3_REGTEST_RPC_ROUTER_HOST_PORT=${ports.router}`,
    `Z3_ZEBRA_IMAGE=${zebraImage}`,
    `Z3_ZAINO_IMAGE=${zainoImage}`,
    `Z3_ZALLET_IMAGE=${zalletImage}`,
    "Z3_REGTEST_RPC_ROUTER_USER=zebra",
    "Z3_REGTEST_RPC_ROUTER_PASSWORD=zebra",
    "",
  ].join("\n");
}

async function prepareRuntime(walletBinary: string): Promise<BootstrapState> {
  await mkdir(runtimeRoot, { recursive: true, mode: 0o700 });
  await chmod(runtimeRoot, 0o700);
  const existingOwner = existsSync(ownerPath) ? await readFile(ownerPath, "utf8") : undefined;
  if (existingOwner && existingOwner !== ownerMarker()) throw new Error(`Ownership marker mismatch at ${ownerPath}`);
  await writeAtomic(ownerPath, ownerMarker());
  const envFile = join(z3Runtime, ".env.regtest");
  const desiredEnv = envFileContents();
  if (existsSync(envFile)) {
    const current = await readFile(envFile, "utf8");
    if (current !== desiredEnv) {
      const existing = commandText("docker", ["ps", "-aq", "--filter", `label=com.docker.compose.project=${composeProject}`]).trim();
      if (existing) throw new Error(`Nivyr Compose config differs from running stack; refusing to rewrite ${envFile}`);
      await writeAtomic(envFile, desiredEnv);
    }
  } else {
    await writeAtomic(envFile, desiredEnv);
  }
  const activationHeights = join(root, "config", "regtest-activation-heights.toml");
  const senderWallet = join(runtimeRoot, "wallets", "sender");
  const senderIdentity = join(runtimeRoot, "wallets", "sender.age");
  await mkdir(join(runtimeRoot, "wallets"), { recursive: true, mode: 0o700 });
  await chmod(join(runtimeRoot, "wallets"), 0o700);
  const prior = await loadState();
  if (prior) {
    if (prior.devtoolPath !== walletBinary || prior.activationHeights !== activationHeights) {
      throw new Error("Existing Nivyr runtime paths do not match this pinned project; refusing to overwrite state");
    }
    return prior;
  }
  const state: BootstrapState = {
    schema: 1,
    project: composeProject,
    z3Commit,
    walletCommit,
    runtimeRoot,
    z3Runtime,
    envFile,
    devtoolPath: walletBinary,
    activationHeights,
    senderWallet,
    senderIdentity,
  };
  await saveState(state);
  return state;
}

function serviceContainers(): string[] {
  return commandText("docker", ["ps", "-aq", "--filter", `label=com.docker.compose.project=${composeProject}`])
    .split(/\s+/).filter(Boolean);
}

function portInUse(port: number): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const socket = createConnection({ host: "127.0.0.1", port });
    socket.setTimeout(350);
    socket.once("connect", () => { socket.destroy(); resolvePromise(true); });
    socket.once("timeout", () => { socket.destroy(); resolvePromise(false); });
    socket.once("error", () => resolvePromise(false));
  });
}

async function checkPorts(): Promise<void> {
  const owned = serviceContainers().length > 0;
  if (owned) return;
  const conflicts: number[] = [];
  for (const port of [ports.zebraRpc, ports.zebraHealth, ports.zainoGrpc, ports.zainoJsonRpc, ports.zalletRpc, ports.router]) {
    if (await portInUse(port)) conflicts.push(port);
  }
  if (conflicts.length) throw new Error(`Required Nivyr regtest ports are busy: ${conflicts.join(", ")}. Stop the owning service or configure another local port set.`);
}

function zebraRpc(): (method: string, params?: readonly unknown[]) => Promise<unknown> {
  let id = 0;
  return async (method, params = []) => {
    const response = await fetch(`http://127.0.0.1:${ports.zebraRpc}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`${rpcUser}:${rpcPassword}`).toString("base64")}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
      signal: AbortSignal.timeout(180_000),
    });
    if (!response.ok) throw new Error(`Zebra RPC ${method} returned HTTP ${response.status}`);
    const payload = await response.json() as JsonRpcResponse<unknown>;
    if (payload.error) throw new Error(`Zebra RPC ${method} failed (${payload.error.code}): ${payload.error.message}`);
    if (!("result" in payload)) throw new Error(`Zebra RPC ${method} returned no result`);
    return payload.result;
  };
}

const indexerRpc = (method: string): Promise<unknown> => rpcNoAuth(`http://127.0.0.1:${ports.zainoJsonRpc}`, method);
let rpcNoAuthId = 0;
async function rpcNoAuth(url: string, method: string): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcNoAuthId, method, params: [] }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Indexer RPC ${method} returned HTTP ${response.status}`);
  const payload = await response.json() as JsonRpcResponse<unknown>;
  if (payload.error) throw new Error(`Indexer RPC ${method} failed (${payload.error.code}): ${payload.error.message}`);
  if (!("result" in payload)) throw new Error(`Indexer RPC ${method} returned no result`);
  return payload.result;
}

async function waitFor<T>(description: string, check: () => Promise<T | false | undefined>, timeoutMs = 180_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const result = await check();
      if (result !== false && result !== undefined) return result as T;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  const detail = lastError instanceof Error ? `; last error: ${lastError.message}` : "";
  throw new Error(`Timed out waiting for ${description}${detail}`);
}

async function chainHeight(rpc: ReturnType<typeof zebraRpc>): Promise<number> {
  const value = await rpc("getblockcount");
  if (typeof value !== "number") throw new Error(`Zebra returned invalid chain height: ${JSON.stringify(value)}`);
  return value;
}

async function waitForIndexer(target: number): Promise<number> {
  return waitFor(`Zaino indexer height ${target}`, async () => {
    const value = await indexerRpc("getblockcount");
    return typeof value === "number" && value >= target ? value : false;
  });
}

async function waitForZebra(rpc: ReturnType<typeof zebraRpc>): Promise<number> {
  return waitFor("Zebra RPC and initialized regtest state", async () => {
    const info = await rpc("getblockchaininfo") as { blocks?: unknown; chain?: unknown };
    const height = await chainHeight(rpc);
    if (typeof info.blocks !== "number" || info.blocks !== height) return false;
    return height;
  });
}

async function ensureActivation(rpc: ReturnType<typeof zebraRpc>): Promise<void> {
  let height = await chainHeight(rpc);
  if (height < 2) {
    const need = 2 - height;
    log(`Mining ${need} NU6.3 activation block(s)`);
    await rpc("generate", [need]);
    height = await chainHeight(rpc);
  }
  const info = await rpc("getblockchaininfo") as { upgrades?: Record<string, { name?: string; status?: string; activationheight?: number }> };
  const nu63 = Object.values(info.upgrades ?? {}).find((upgrade) => upgrade.name === "NU6.3");
  if (!nu63 || nu63.status !== "active" || height < 2) {
    throw new Error(`Pinned regtest is not NU6.3-active at height ${height}: ${JSON.stringify(nu63 ?? null)}`);
  }
}

async function setMinerAddress(address: string, state: BootstrapState): Promise<void> {
  const ids = serviceContainers();
  if (ids.length) {
    const zebraId = commandText("docker", ["compose", "--env-file", state.envFile, "ps", "-q", "zebra"], { cwd: state.z3Runtime }).trim();
    if (zebraId) {
      const env = commandText("docker", ["inspect", zebraId, "--format", "{{range .Config.Env}}{{println .}}{{end}}"]);
      const current = env.split(/\r?\n/).find((line) => line.startsWith("ZEBRA_MINING__MINER_ADDRESS="))?.split("=").slice(1).join("=");
      if (current === address) return;
    }
  }
  log(`Configuring Zebra coinbase receiver ${address}`);
  const env = { ...process.env, ZEBRA_MINING__MINER_ADDRESS: address };
  compose(["--profile", "indexer", "up", "-d", "--no-deps", "--force-recreate", "zebra"], env);
  const rpc = zebraRpc();
  await waitForZebra(rpc);
}

async function ensureWallet(state: BootstrapState): Promise<string> {
  const hasWallet = existsSync(join(state.senderWallet, "keys.toml"));
  const hasIdentity = existsSync(state.senderIdentity);
  if (hasWallet !== hasIdentity) {
    throw new Error(`Sender wallet is partially initialized at ${state.senderWallet}; preserving it for manual recovery instead of overwriting it`);
  }
  if (!hasWallet) {
    await mkdir(state.senderWallet, { recursive: true, mode: 0o700 });
    await chmod(state.senderWallet, 0o700);
    log("Creating a new disposable regtest sender wallet");
    commandText(state.devtoolPath, [
      "wallet", "-w", state.senderWallet, "init",
      "--name", "NivyrSender",
      "--identity", state.senderIdentity,
      "--network", "regtest",
      "--activation-heights", state.activationHeights,
      "--server", `localhost:${ports.zainoGrpc}`,
    ], { input: "\n", timeoutMs: 120_000 });
  }
  const addressOutput = commandText(state.devtoolPath, [
    "wallet", "-w", state.senderWallet, "list-addresses", "--receiver", "transparent",
  ]);
  const addresses = [...addressOutput.matchAll(/^Receiver\(transparent\):\s*(\S+)\s*$/gm)].map((match) => match[1]);
  if (addresses.length !== 1) {
    throw new Error(`Expected exactly one sender transparent receiver from pinned zcash-devtool, found ${addresses.length}`);
  }
  if (state.senderAddress && state.senderAddress !== addresses[0]) {
    throw new Error("Existing wallet's miner receiver differs from bootstrap state; refusing to mine rewards to a different key");
  }
  state.senderAddress = addresses[0];
  await saveState(state);
  return addresses[0];
}

function walletCommand(state: BootstrapState, args: readonly string[], input?: string): string {
  return commandText(state.devtoolPath, ["wallet", "-w", state.senderWallet, ...args], {
    input,
    timeoutMs: 300_000,
  });
}

function walletBalance(state: BootstrapState): WalletBalance {
  const output = walletCommand(state, ["balance", "--json", "--min-confirmations", "1"]);
  let balance: WalletBalance;
  try {
    balance = JSON.parse(output) as WalletBalance;
  } catch {
    throw new Error(`Pinned wallet balance --json returned invalid JSON: ${output.slice(0, 500)}`);
  }
  for (const key of ["ironwood_spendable", "transparent_spendable", "chain_tip_height"] as const) {
    if (typeof balance[key] !== "number") throw new Error(`Pinned wallet balance JSON is missing numeric ${key}`);
  }
  return balance;
}

async function mineToHeight(target: number, rpc: ReturnType<typeof zebraRpc>): Promise<number> {
  let current = await chainHeight(rpc);
  if (current < target) {
    const blocks = target - current;
    log(`Mining ${blocks} block(s) to height ${target}`);
    await rpc("generate", [blocks]);
    current = await chainHeight(rpc);
  }
  if (current < target) throw new Error(`Zebra stopped at ${current}; expected height ${target}`);
  return current;
}

async function getRawTransaction(txid: string, rpc: ReturnType<typeof zebraRpc>): Promise<RawTx> {
  return await rpc("getrawtransaction", [txid, 1]) as RawTx;
}

async function recoverPendingShield(state: BootstrapState, rpc: ReturnType<typeof zebraRpc>): Promise<string | undefined> {
  let listed: Array<{ txid?: string; mined_height?: number | null }>;
  try {
    listed = JSON.parse(walletCommand(state, ["list-tx", "--json"])) as Array<{ txid?: string; mined_height?: number | null }>;
  } catch {
    return undefined;
  }
  for (const transaction of listed.filter((item) => item.mined_height == null && typeof item.txid === "string")) {
    try {
      const raw = await getRawTransaction(transaction.txid!, rpc);
      if ((raw.ironwood?.actions?.length ?? 0) > 0 && (raw.vin?.length ?? 0) > 0) return transaction.txid;
    } catch {
      // Rejected/expired local wallet transactions are absent from Zebra's mempool.
    }
  }
  return undefined;
}

async function ensureFunding(state: BootstrapState, rpc: ReturnType<typeof zebraRpc>): Promise<WalletBalance> {
  const sender = state.senderAddress!;
  let height = await chainHeight(rpc);
  if (!state.funding) {
    state.funding = { startHeight: height, controlledTarget: height + 100 };
    state.ready = false;
    await saveState(state);
  }
  const funding = state.funding;
  let currentMiner = await currentMinerAddress(state);
  if (!funding.controlledEndHeight) {
    if (height < funding.controlledTarget) {
      if (currentMiner !== sender) await setMinerAddress(sender, state);
      await mineToHeight(funding.controlledTarget, rpc);
      height = await chainHeight(rpc);
      currentMiner = await currentMinerAddress(state);
    }
    funding.controlledEndHeight = currentMiner === sender ? height : funding.controlledTarget;
    funding.maturityTarget = funding.controlledEndHeight + 100;
    await saveState(state);
  }
  if (currentMiner !== defaultMinerAddress) await setMinerAddress(defaultMinerAddress, state);
  // Zebra can reopen a few blocks behind the height returned immediately after
  // `generate`. Once the default miner is active, the current tip is the last
  // height at which this wallet could have received a coinbase reward. Base
  // maturity on that observed tip instead of assuming every generated block
  // survived the service restart.
  height = await chainHeight(rpc);
  if (height < funding.controlledEndHeight) {
    if (height < funding.startHeight) {
      throw new Error(`Zebra reopened at ${height}, before Nivyr funding began at ${funding.startHeight}`);
    }
    log(`Zebra reopened at ${height}, below the recorded controlled-mining tip ${funding.controlledEndHeight}; adjusting coinbase maturity target`);
    funding.controlledEndHeight = height;
    funding.maturityTarget = height + 100;
    await saveState(state);
  }
  const maturityTarget = funding.maturityTarget ?? funding.controlledEndHeight + 100;
  await mineToHeight(maturityTarget, rpc);
  height = await chainHeight(rpc);
  await waitForIndexer(height);
  walletCommand(state, ["sync", "--server", `localhost:${ports.zainoGrpc}`]);
  const transparent = walletBalance(state);
  if (transparent.chain_tip_height < height) {
    throw new Error(`Sender wallet scan is at ${transparent.chain_tip_height}, below chain height ${height}`);
  }
  if (transparent.transparent_spendable <= 0) {
    throw new Error(`No mature spendable transparent funding at height ${height}; wallet balance: ${JSON.stringify(transparent)}`);
  }
  log(`Mature transparent balance observed: ${(transparent.transparent_spendable / 100_000_000).toFixed(8)} ZEC`);

  if (!state.shieldTxid) state.shieldTxid = await recoverPendingShield(state, rpc);
  if (!state.shieldTxid) {
    log("Shielding mature local coinbase rewards to the NU6.3-active pool");
    const output = walletCommand(state, ["shield", "--identity", state.senderIdentity, "--server", `localhost:${ports.zainoGrpc}`]);
    const matches = [...output.matchAll(/\b([0-9a-f]{64})\b/g)];
    state.shieldTxid = matches.at(-1)?.[1];
    if (!state.shieldTxid) throw new Error(`wallet shield returned no transaction id: ${output.slice(-1000)}`);
    await saveState(state);
  }

  let shield = await waitFor("shield transaction in Zebra mempool", async () => {
    try { return await getRawTransaction(state.shieldTxid!, rpc); } catch { return false; }
  });
  const pool = shield.ironwood?.actions?.length ?? 0;
  if (shield.version !== 6 || pool <= 0 || (shield.orchard?.actions?.length ?? 0) > 0 || (shield.vShieldedOutput?.length ?? 0) > 0) {
    throw new Error(`Shield transaction did not use only the active Ironwood path: ${JSON.stringify({ version: shield.version, ironwoodActions: pool, orchardActions: shield.orchard?.actions?.length ?? 0, saplingOutputs: shield.vShieldedOutput?.length ?? 0 })}`);
  }
  if (!shield.in_active_chain) {
    await rpc("generate", [1]);
    shield = await waitFor("shield transaction confirmation", async () => {
      const current = await getRawTransaction(state.shieldTxid!, rpc);
      return current.in_active_chain ? current : false;
    });
  }
  const txHeight = shield.height;
  if (typeof txHeight !== "number") throw new Error(`Confirmed shield transaction has no mined height: ${state.shieldTxid}`);
  await waitForIndexer(txHeight);
  walletCommand(state, ["sync", "--server", `localhost:${ports.zainoGrpc}`]);
  const finalBalance = walletBalance(state);
  if (finalBalance.ironwood_spendable < targetSpendableZatoshi) {
    throw new Error(`Shield confirmation did not produce the required spendable Ironwood balance: ${JSON.stringify(finalBalance)}`);
  }
  state.ready = true;
  state.readyAt = new Date().toISOString();
  await saveState(state);
  return finalBalance;
}

async function currentMinerAddress(state: BootstrapState): Promise<string> {
  const zebraId = commandText("docker", ["compose", "--env-file", state.envFile, "ps", "-q", "zebra"], { cwd: state.z3Runtime }).trim();
  if (!zebraId) return "";
  const env = commandText("docker", ["inspect", zebraId, "--format", "{{range .Config.Env}}{{println .}}{{end}}"]);
  return env.split(/\r?\n/).find((line) => line.startsWith("ZEBRA_MINING__MINER_ADDRESS="))?.split("=").slice(1).join("=") ?? "";
}

async function up(): Promise<void> {
  ensurePrerequisites();
  process.umask(0o077);
  await mkdir(runtimeRoot, { recursive: true, mode: 0o700 });
  const walletBinary = await ensurePinnedSources();
  let state = await prepareRuntime(walletBinary);
  await checkPorts();
  log(`Preparing isolated Compose project ${composeProject}`);
  commandText(join(z3Runtime, "scripts", "regtest-init.sh"), ["--prepare-only"], { cwd: z3Runtime });
  compose(["--profile", "indexer", "up", "-d", "zebra"]);
  const rpc = zebraRpc();
  let height = await waitForZebra(rpc);
  await ensureActivation(rpc);
  compose(["--profile", "indexer", "up", "-d", "zaino"]);
  height = await waitForIndexer(await chainHeight(rpc));
  log(`Pinned Zebra ready at ${height}; pinned Zaino converged`);
  const senderAddress = await ensureWallet(state);
  await waitForIndexer(await chainHeight(rpc));
  walletCommand(state, ["sync", "--server", `localhost:${ports.zainoGrpc}`]);
  let balance = walletBalance(state);
  if (balance.ironwood_spendable < targetSpendableZatoshi) {
    balance = await ensureFunding(state, rpc);
  } else {
    state.ready = true;
    state.readyAt ??= new Date().toISOString();
    await saveState(state);
  }
  const chain = await rpc("getblockchaininfo") as { blocks?: number; upgrades?: Record<string, { name?: string; status?: string }> };
  const nu63 = Object.values(chain.upgrades ?? {}).find((upgrade) => upgrade.name === "NU6.3");
  const result = {
    status: "READY",
    project: composeProject,
    z3Commit,
    zebraImage,
    zainoImage,
    walletCommit,
    chainHeight: chain.blocks,
    nu6_3: nu63?.status,
    senderAddress,
    ironwoodSpendableZatoshi: balance.ironwood_spendable,
    ironwoodSpendableZec: (balance.ironwood_spendable / 100_000_000).toFixed(8),
    zebraRpcUrl: `http://127.0.0.1:${ports.zebraRpc}`,
    zainoJsonRpcUrl: `http://127.0.0.1:${ports.zainoJsonRpc}`,
    lightwalletdAddress: `localhost:${ports.zainoGrpc}`,
    runtimeRoot,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

async function down(): Promise<void> {
  if (!existsSync(ownerPath)) {
    log(`No Nivyr-owned runtime at ${runtimeRoot}; nothing to stop`);
    return;
  }
  const owner = await readFile(ownerPath, "utf8");
  if (owner !== ownerMarker()) throw new Error(`Ownership marker mismatch at ${ownerPath}; refusing shutdown`);
  const envFile = join(z3Runtime, ".env.regtest");
  if (!existsSync(envFile)) {
    log("Nivyr Compose environment is absent; no stack to stop");
    return;
  }
  log(`Stopping only Compose project ${composeProject}; volumes and sender wallet are preserved`);
  compose(["--profile", "*", "down"]);
}

const action = process.argv[2];
try {
  if (action === "up") await up();
  else if (action === "down") await down();
  else throw new Error("Usage: npm run nivyr:up | npm run nivyr:down");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[nivyr] ERROR: ${message}\n`);
  process.exitCode = 1;
}
