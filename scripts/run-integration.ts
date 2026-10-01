import { spawnSync } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = resolve(process.env.NIVYR_BOOTSTRAP_ROOT ?? `${root}/.cache/runtime/nivyr-bootstrap`);
const statePath = resolve(runtimeRoot, "state.json");
const environment = { ...process.env };

try {
  const state = JSON.parse(await readFile(statePath, "utf8")) as {
    devtoolPath: string;
    runtimeRoot: string;
    activationHeights: string;
    senderWallet: string;
    senderIdentity: string;
  };
  environment.NIVYR_DEVTOOL ??= state.devtoolPath;
  environment.NIVYR_RUNTIME_ROOT ??= state.runtimeRoot;
  environment.NIVYR_ACTIVATION_HEIGHTS ??= state.activationHeights;
  environment.NIVYR_SENDER_WALLET ??= state.senderWallet;
  environment.NIVYR_SENDER_IDENTITY ??= state.senderIdentity;
  environment.NIVYR_ZEBRA_RPC_URL ??= "http://127.0.0.1:49232";
  environment.NIVYR_ZAINO_RPC_URL ??= "http://127.0.0.1:49237";
  environment.NIVYR_LIGHTWALLETD_ADDRESS ??= "localhost:49137";
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}

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
