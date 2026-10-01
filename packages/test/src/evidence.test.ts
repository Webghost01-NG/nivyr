import { describe, expect, it } from "vitest";
import { sanitizeEvidence } from "./evidence.js";

describe("evidence sanitization", () => {
  it("redacts identity material and local paths while preserving lifecycle evidence", () => {
    expect(sanitizeEvidence({
      identity_secret: "private-value",
      senderIdentity: "/home/example/.cache/wallet.age",
      observation: {
        txid: "a".repeat(64),
        pool: "ironwood",
        memo: "NIVYR-ORDER-42",
        height: 42,
      },
    })).toEqual({
      identity_secret: "[REDACTED]",
      senderIdentity: "[REDACTED]",
      observation: {
        txid: "a".repeat(64),
        pool: "ironwood",
        memo: "NIVYR-ORDER-42",
        height: 42,
      },
    });
  });

  it("redacts age identities and home-directory paths embedded in text", () => {
    expect(sanitizeEvidence("identity=AGE-SECRET-KEY-1EXAMPLE /Users/example/wallet.age"))
      .toBe("identity=[REDACTED] [LOCAL_PATH_REDACTED]");
  });
});
