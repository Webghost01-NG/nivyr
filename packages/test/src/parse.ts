import type { DetectedPayment, ShieldedPool, WalletRef } from "./types.js";

const TXID = /^[0-9a-f]{64}$/;

export function parseWallet(stdout: string, name: string, directory: string, identityFile: string): WalletRef {
  const accountId = stdout.match(/Account(?: AccountUuid)?\(([0-9a-f-]{36})\)/i)?.[1];
  const address = stdout.match(/Default Address:\s*(uregtest1\S+)/)?.[1];
  if (!accountId || !address) {
    throw new Error(`Could not parse wallet identity from zcash-devtool output: ${stdout}`);
  }
  return { name, directory, identityFile, accountId, address };
}

export function parseTxid(stdout: string): string {
  const txid = stdout.trim().split(/\r?\n/).reverse().map((line) => line.trim()).find((value) => TXID.test(value));
  if (!txid) throw new Error(`Could not parse transaction id from output: ${stdout}`);
  return txid;
}

export function zecToZatoshi(value: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value)) {
    throw new Error(`Invalid ZEC amount: ${value}`);
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, "0"));
}

function parseFormattedAmount(value: string): bigint {
  const normalized = value.trim().replace(/\s+[A-Z]+$/, "");
  const negative = normalized.startsWith("-");
  const amount = zecToZatoshi(negative ? normalized.slice(1).trim() : normalized);
  return negative ? -amount : amount;
}

export function parseDetectedPayment(text: string, txid: string): DetectedPayment | null {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === txid);
  if (start < 0) return null;
  const next = lines.findIndex((line, index) => index > start && TXID.test(line.trim()));
  const section = lines.slice(start, next < 0 ? undefined : next).join("\n");
  const minedRaw = section.match(/^\s*Mined:\s*(\d+)/m)?.[1];
  const amountRaw = section.match(/^\s*Amount:\s*([^\n]+)/m)?.[1];
  const poolRaw = section.match(/^\s*Output \d+ \((Sapling|Orchard|Ironwood)\)/mi)?.[1];
  const memo = section.match(/^\s*Memo:\s*Memo::Text\("(.*)"\)$/m)?.[1] ?? null;
  if (!amountRaw || !poolRaw) return null;
  return {
    txid,
    minedHeight: minedRaw ? Number(minedRaw) : null,
    amountZatoshi: parseFormattedAmount(amountRaw),
    pool: poolRaw.toLowerCase() as ShieldedPool,
    memo,
  };
}

export function parseWalletScanHeight(stdout: string): number | null {
  const ends = Array.from(stdout.matchAll(/Scan complete for range Historic\(\d+\.\.(\d+)\)/g), (match) => Number(match[1]));
  return ends.length > 0 ? Math.max(...ends) - 1 : null;
}
