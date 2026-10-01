import { describe, expect, it } from "vitest";
import { parseDetectedPayment, parseWalletScanHeight, zecToZatoshi } from "./parse.js";

describe("Zcash output parsing", () => {
  it("converts decimal ZEC without floating point", () => {
    expect(zecToZatoshi("2")).toBe(200_000_000n);
    expect(zecToZatoshi("1.00000001")).toBe(100_000_001n);
    expect(() => zecToZatoshi("0.000000001")).toThrow("Invalid ZEC amount");
  });

  it("extracts an Ironwood payment and decrypted text memo", () => {
    const txid = "9dde289f2c649c727b3aa69bb13ad70e69d7c8de17e863c94b233027dd9e3691";
    const payment = parseDetectedPayment(`Transactions:\n${txid}\n     Mined: 209\n    Amount:   2.00000000 REG\n  Output 1 (Ironwood)\n    Value:   2.00000000 REG\n    Memo: Memo::Text(\"NIVYR-SPIKE-001\")\n`, txid);
    expect(payment).toEqual({
      txid,
      minedHeight: 209,
      amountZatoshi: 200_000_000n,
      pool: "ironwood",
      memo: "NIVYR-SPIKE-001",
    });
  });

  it("keeps scan height distinct from the returned exclusive range end", () => {
    expect(parseWalletScanHeight("Scan complete for range Historic(208..210); progress is 0/0")).toBe(209);
    expect(parseWalletScanHeight("No new scan ranges")).toBeNull();
  });
});
