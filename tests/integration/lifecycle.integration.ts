import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createNivyr, type Nivyr, type WalletRef } from "../../packages/test/src/index.js";
import { MerchantClient } from "../../examples/merchant/client.js";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the real integration test`);
  return value;
};

interface RunEvidence {
  run: number;
  txid: string;
  memo: string;
  beforeMine: unknown;
  afterMine: unknown;
  beforeSync: unknown;
  appStatuses: { afterMine: string; afterScan: string; afterEnhance: string };
  afterSync: unknown;
  afterEnhance: unknown;
  timingsMs: Record<string, number>;
}

describe("real Ironwood lifecycle", () => {
  let nivyr: Nivyr;
  let sender: WalletRef;
  let merchantProcess: ChildProcess;
  const merchant = new MerchantClient();
  const evidence: RunEvidence[] = [];
  const runtimeRoot = resolve(required("NIVYR_RUNTIME_ROOT"));
  const evidenceDir = resolve(process.env.NIVYR_EVIDENCE_DIR ?? "docs/evidence/runs");

  beforeAll(async () => {
    merchantProcess = spawn(process.execPath, ["--experimental-strip-types", "examples/merchant/server.ts"], {
      cwd: process.cwd(),
      env: { ...process.env, MERCHANT_PORT: "8787" },
      stdio: "ignore",
    });
    await waitForHttp("http://127.0.0.1:8787/invoices/ping");
    nivyr = createNivyr({
      devtoolPath: required("NIVYR_DEVTOOL"),
      walletRoot: runtimeRoot,
      activationHeightsPath: required("NIVYR_ACTIVATION_HEIGHTS"),
    });
    sender = await nivyr.openWallet(
      "Alice",
      required("NIVYR_SENDER_WALLET"),
      required("NIVYR_SENDER_IDENTITY"),
    );
    await nivyr.sync(sender);
  });

  afterAll(async () => {
    merchantProcess.kill();
    await mkdir(evidenceDir, { recursive: true });
    await writeFile(
      resolve(evidenceDir, "repeatability.json"),
      `${JSON.stringify(evidence, null, 2)}\n`,
      { mode: 0o644 },
    );
  });

  for (const run of [1, 2, 3]) {
    it(`holds detection and memo behind explicit wallet operations (run ${run})`, async () => {
      const memo = run === 3 ? "NIVYR-ORDER-69" : `NIVYR-SPIKE-RUN-${run}`;
      const started = Date.now();
      const height = await nivyr.chainHeight();
      const recipient = await nivyr.wallet({
        name: `recipient-${run}-${height}-${randomUUID().slice(0, 8)}`,
        birthday: height,
      });
      const expectedMemo = run === 3 ? "NIVYR-ORDER-42" : memo;
      const invoice = await merchant.createInvoice({
        amount: "0.01",
        ref: expectedMemo,
        address: recipient.address,
      });
      const walletCreated = Date.now();
      const txid = await nivyr.pay({
        from: sender,
        to: invoice.address,
        amount: "0.01",
        memo,
        minConfirmations: 1,
      });
      const broadcast = Date.now();
      const beforeMine = await nivyr.transaction(txid);
      const beforeMineRecipient = await nivyr.observeWallet(recipient, txid);
      expect(beforeMine).toMatchObject({
        version: 6,
        broadcast: true,
        mined: false,
        transparentInputs: 0,
        transparentOutputs: 0,
        saplingSpends: 0,
        saplingOutputs: 0,
        orchardActions: 0,
      });
      expect(beforeMine.ironwoodActions).toBeGreaterThan(0);
      expect(beforeMineRecipient.detected).toBe(false);

      await nivyr.mine(1);
      const mined = Date.now();
      const afterMine = await nivyr.waitForTransaction(txid, (tx) => tx.mined);
      await nivyr.waitForIndexer(afterMine.height!);
      const indexed = Date.now();
      const beforeSync = await nivyr.observeWallet(recipient, txid);
      expect(beforeSync.detected).toBe(false);
      const onChainInvoice = await merchant.observe(invoice.id, {
        mined: true,
        recipientDetected: beforeSync.detected,
        amountZatoshi: beforeSync.payment?.amountZatoshi.toString() ?? null,
        memo: beforeSync.payment?.memo ?? null,
      });
      expect(onChainInvoice.status).toBe("unpaid");

      await nivyr.sync(recipient);
      const synced = Date.now();
      const afterSync = await nivyr.observeWallet(recipient, txid);
      expect(afterSync).toMatchObject({
        detected: true,
        minedHeight: afterMine.height,
        payment: {
          txid,
          amountZatoshi: 1_000_000n,
          pool: "ironwood",
          memo: null,
        },
      });
      const scannedInvoice = await merchant.observe(invoice.id, {
        mined: true,
        recipientDetected: afterSync.detected,
        amountZatoshi: afterSync.payment?.amountZatoshi.toString() ?? null,
        memo: afterSync.payment?.memo ?? null,
      });
      expect(scannedInvoice.status).toBe("unpaid");

      await nivyr.enhance(recipient);
      const enhanced = Date.now();
      const afterEnhance = await nivyr.observeWallet(recipient, txid);
      expect(afterEnhance.payment?.memo).toBe(memo);
      const finalInvoice = await merchant.observe(invoice.id, {
        mined: true,
        recipientDetected: afterEnhance.detected,
        amountZatoshi: afterEnhance.payment?.amountZatoshi.toString() ?? null,
        memo: afterEnhance.payment?.memo ?? null,
      });
      expect(finalInvoice.status).toBe(memo === expectedMemo ? "paid" : "unpaid");

      evidence.push({
        run,
        txid,
        memo,
        beforeMine,
        afterMine,
        beforeSync,
        appStatuses: {
          afterMine: onChainInvoice.status,
          afterScan: scannedInvoice.status,
          afterEnhance: finalInvoice.status,
        },
        afterSync: serializeWallet(afterSync),
        afterEnhance: serializeWallet(afterEnhance),
        timingsMs: {
          walletCreation: walletCreated - started,
          broadcast: broadcast - walletCreated,
          mining: mined - broadcast,
          indexerConvergence: indexed - mined,
          walletSync: synced - indexed,
          memoEnhancement: enhanced - synced,
          total: enhanced - started,
        },
      });

      await nivyr.sync(sender);
    });
  }
});

function serializeWallet(observation: Awaited<ReturnType<Nivyr["observeWallet"]>>): unknown {
  return {
    ...observation,
    payment: observation.payment && {
      ...observation.payment,
      amountZatoshi: observation.payment.amountZatoshi.toString(),
    },
  };
}

async function waitForHttp(url: string): Promise<void> {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status === 404) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  throw new Error(`Timed out waiting for reference app at ${url}`);
}
