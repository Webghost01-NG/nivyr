import { spawn } from "node:child_process";

export interface WalletBackend {
  execute(args: readonly string[], timeoutMs?: number): Promise<CommandResult>;
}

export class LocalDevtoolBackend implements WalletBackend {
  constructor(private readonly executable: string) {}

  execute(args: readonly string[], timeoutMs = 300_000): Promise<CommandResult> {
    return run(this.executable, args, timeoutMs);
  }
}

export class ContainerDevtoolBackend implements WalletBackend {
  constructor(
    private readonly image: string,
    private readonly runtimeRoot: string,
    private readonly activationHeightsPath: string,
    private readonly composeNetwork: string,
  ) {
    if (!/@sha256:[a-f0-9]{64}$/.test(image)) throw new Error("ContainerDevtoolBackend requires a digest-pinned image reference");
  }

  execute(args: readonly string[], timeoutMs = 300_000): Promise<CommandResult> {
    const uid = typeof process.getuid === "function" ? process.getuid() : 10001;
    const gid = typeof process.getgid === "function" ? process.getgid() : 10001;
    const mapped = args.map((arg) => {
      if (arg === this.activationHeightsPath) return "/nivyr-package/regtest-activation-heights.toml";
      if (arg.startsWith(`${this.runtimeRoot}/`)) return `/nivyr/${arg.slice(this.runtimeRoot.length + 1)}`;
      return arg;
    });
    return run("docker", [
      "run", "--rm", "--platform", "linux/amd64", "--user", `${uid}:${gid}`,
      "--network", this.composeNetwork,
      "--mount", `type=bind,source=${this.runtimeRoot},target=/nivyr`,
      "--mount", `type=bind,source=${this.activationHeightsPath},target=/nivyr-package/regtest-activation-heights.toml,readonly`,
      this.image,
      ...mapped,
    ], timeoutMs);
  }
}

export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
}

export class CommandError extends Error {
  constructor(
    readonly executable: string,
    readonly args: readonly string[],
    readonly exitCode: number | null,
    readonly stdout: string,
    readonly stderr: string,
    readonly timedOut = false,
  ) {
    super(timedOut
      ? `${executable} timed out or was terminated before it completed`
      : `${executable} exited with ${exitCode}: ${stderr.trim() || stdout.trim()}`);
  }
}

export async function run(
  executable: string,
  args: readonly string[],
  timeoutMs = 300_000,
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: timeoutMs,
      killSignal: "SIGTERM",
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      const timedOut = "code" in error && error.code === "ETIMEDOUT";
      reject(timedOut
        ? new Error(`${executable} exceeded its ${timeoutMs}ms process timeout; check wallet/service readiness and retry`)
        : error);
    });
    child.on("close", (exitCode) => {
      if (exitCode === 0) resolve({ stdout, stderr });
      else reject(new CommandError(executable, args, exitCode, stdout, stderr, exitCode === null));
    });
  });
}
