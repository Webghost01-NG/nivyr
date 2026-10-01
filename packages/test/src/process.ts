import { spawn } from "node:child_process";

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
