import { describe, expect, it } from "vitest";
import { run } from "./process.js";

describe("wallet process execution", () => {
  it("bounds a stalled child process", async () => {
    await expect(run(process.execPath, ["-e", "setTimeout(() => {}, 5000)"], 100))
      .rejects.toThrow(/timed out|terminated/i);
  });
});
