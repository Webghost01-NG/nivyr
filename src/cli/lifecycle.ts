import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { InvoiceRef, InvoiceState, PaymentAppAdapter } from "../../packages/test/src/adapter.js";
import { createNivyr } from "../../packages/test/src/index.js";
import { ContainerDevtoolBackend } from "../../packages/test/src/process.js";
import type { WalletRef } from "../../packages/test/src/types.js";

const runtimeRoot = resolve(process.env.NIVYR_RUNTIME_ROOT ?? join(process.cwd(), ".nivyr"));
const packageRoot = resolve(process.env.NIVYR_PACKAGE_ROOT ?? process.cwd());
const image = process.env.NIVYR_DEVTOOL_IMAGE ?? "";

async function main(): Promise<void> {
  const state = JSON.parse(await readFile(join(runtimeRoot, "state.json"), "utf8")) as {
    ready?: boolean; project: string; devtoolPath: string; senderWallet: string; senderIdentity: string;
  };
  if (state.ready !== true) throw new Error("Nivyr runtime is not READY. Run npx nivyr up and preserve its state for recovery.");
  const activationHeightsPath = join(packageRoot, "config", "regtest-activation-heights.toml");
  const nivyr = createNivyr({
    devtoolPath: state.devtoolPath,
    walletRoot: join(runtimeRoot, "wallets"),
    activationHeightsPath,
    zebraRpcUrl: "http://127.0.0.1:49232",
    zainoRpcUrl: "http://127.0.0.1:49237",
    lightwalletdAddress: "127.0.0.1:8137",
    walletBackend: new ContainerDevtoolBackend(image, runtimeRoot, activationHeightsPath, `container:${state.project}-zaino-1`),
    timeoutMs: 180_000,
  });
  const sender: WalletRef = await nivyr.openWallet("NivyrSender", state.senderWallet, state.senderIdentity);
  await nivyr.sync(sender);
  const invoices = new Map<string, { id: string; amount: string; reference: string; destination: string; pattern: "memo" | "destination"; status: "unpaid" | "paid" }>();
  const app = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const sendJson = (status: number, value: unknown) => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(value)); };
    const createMatch = url.pathname.match(/^\/(memo|destination)\/invoices$/);
    if (request.method === "POST" && createMatch) {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { amount: string; reference: string; destination: string };
      const invoice = { id: randomUUID(), ...input, pattern: createMatch[1] as "memo" | "destination", status: "unpaid" as const };
      invoices.set(invoice.id, invoice);
      sendJson(201, invoice);
      return;
    }
    const match = url.pathname.match(/^\/(memo|destination)\/invoices\/([^/]+)(?:\/(claim|observation))?$/);
    const invoice = match && invoices.get(match[2]!);
    if (!match || !invoice) { sendJson(404, { error: "invoice not found" }); return; }
    if (request.method === "GET" && !match[3]) { sendJson(200, invoice); return; }
    if (request.method !== "POST" || !match[3]) { sendJson(405, { error: "method not allowed" }); return; }
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { txid?: string; mined?: boolean; recipientDetected?: boolean; amountZatoshi?: string; memo?: string | null; destinationObserved?: boolean };
    if (match[3] === "claim") {
      const transaction = body.txid ? await nivyr.transaction(body.txid).catch(() => undefined) : undefined;
      if (transaction?.mined) invoice.status = "paid";
    } else {
      const reconciled = invoice.pattern === "memo" ? body.memo === invoice.reference : body.destinationObserved === true;
      invoice.status = body.mined === true && body.recipientDetected === true
        && body.amountZatoshi === "1000000" && reconciled ? "paid" : "unpaid";
    }
    sendJson(200, invoice);
  });
  await new Promise<void>((resolveListen, rejectListen) => {
    app.once("error", rejectListen);
    app.listen(0, "127.0.0.1", () => resolveListen());
  });
  const appAddress = app.address();
  if (!appAddress || typeof appAddress === "string") throw new Error("Could not bind the application API.");
  const appUrl = `http://127.0.0.1:${appAddress.port}`;
  async function appRequest<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${appUrl}${path}`, { method: body ? "POST" : "GET", headers: { "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) throw new Error(`Reference payment app returned HTTP ${response.status}`);
    return await response.json() as T;
  }
  class ReferenceHttpAdapter implements PaymentAppAdapter {
    constructor(private readonly pattern: "memo" | "destination") {}
    async createInvoice(input: { amount: string; reference: string; destination?: string }): Promise<InvoiceRef> {
      return await appRequest<InvoiceRef>(`/${this.pattern}/invoices`, input);
    }
    async getInvoice(id: string): Promise<InvoiceState> {
      return await appRequest<InvoiceState>(`/${this.pattern}/invoices/${id}`);
    }
    async claimTxid(id: string, txid: string): Promise<InvoiceState> {
      return await appRequest<InvoiceState>(`/${this.pattern}/invoices/${id}/claim`, { txid });
    }
    async submitObservation(id: string, observation: { txid: string; mined: boolean; recipientDetected: boolean; amountZatoshi: string | null; memo: string | null; destinationObserved: boolean }): Promise<InvoiceState> {
      return await appRequest<InvoiceState>(`/${this.pattern}/invoices/${id}/observation`, observation);
    }
  }
  async function runForgedTxidScenario(pattern: "memo" | "destination"): Promise<Record<string, unknown>> {
    const adapter = new ReferenceHttpAdapter(pattern);
    const expectedWallet = await nivyr.wallet({ name: `order-42-${pattern}-${randomUUID().slice(0, 8)}` });
    const invoice = await adapter.createInvoice({ amount: "0.01", reference: "ORDER-42", destination: expectedWallet.address });
    const unrelatedWallet = await nivyr.wallet({ name: `unrelated-${randomUUID().slice(0, 8)}` });
    const invalidTxid = await nivyr.pay({ from: sender, to: unrelatedWallet, amount: "0.01", memo: "NOT-ORDER-42", minConfirmations: 1 });
    await nivyr.mine(1);
    const invalidMined = await nivyr.waitForTransaction(invalidTxid, (tx) => tx.mined);
    await nivyr.waitForIndexer(invalidMined.height!);
    await nivyr.sync(sender);
    const buggy = await adapter.claimTxid(invoice.id, invalidTxid);
    if (buggy.status !== "paid") throw new Error(`${pattern} fixture did not reproduce mined-only settlement.`);
    const invalidObservation = await nivyr.observeWallet(expectedWallet, invalidTxid);
    const correctedAfterAttack = await adapter.submitObservation(invoice.id, {
      txid: invalidTxid, mined: invalidMined.mined, recipientDetected: invalidObservation.detected,
      amountZatoshi: invalidObservation.payment?.amountZatoshi.toString() ?? null,
      memo: invalidObservation.payment?.memo ?? null, destinationObserved: invalidObservation.detected,
    });
    if (correctedAfterAttack.status !== "unpaid") throw new Error(`${pattern} fixture accepted unrelated mined payment.`);
    const validTxid = await nivyr.pay({ from: sender, to: invoice.destination, amount: invoice.amount, memo: invoice.reference, minConfirmations: 1 });
    await nivyr.mine(1);
    const validMined = await nivyr.waitForTransaction(validTxid, (tx) => tx.mined);
    await nivyr.waitForIndexer(validMined.height!);
    await nivyr.sync(sender);
    await nivyr.sync(expectedWallet);
    const validDetected = await nivyr.observeWallet(expectedWallet, validTxid);
    await nivyr.enhance(expectedWallet);
    const validEnhanced = await nivyr.observeWallet(expectedWallet, validTxid);
    const correctedPaid = await adapter.submitObservation(invoice.id, {
      txid: validTxid, mined: validMined.mined, recipientDetected: validDetected.detected,
      amountZatoshi: validEnhanced.payment?.amountZatoshi.toString() ?? null,
      memo: validEnhanced.payment?.memo ?? null, destinationObserved: validDetected.detected,
    });
    if (correctedPaid.status !== "paid" || (await adapter.getInvoice(invoice.id)).status !== "paid") {
      throw new Error(`${pattern} fixture did not settle its wallet-observed expected payment.`);
    }
    return {
      applicationPattern: pattern === "memo" ? "memo-based invoice reconciliation" : "per-invoice destination reconciliation",
      invoice: "ORDER-42", invalidTxid, invalidMinedHeight: invalidMined.height,
      invalidCondition: "real mined transaction paid an unrelated recipient with a wrong memo",
      buggyMerchantStatus: buggy.status, correctedStatusAfterInvalid: correctedAfterAttack.status,
      validTxid, validMinedHeight: validMined.height, validAmountZatoshi: validEnhanced.payment?.amountZatoshi.toString(),
      validMemoMatched: validEnhanced.payment?.memo === invoice.reference, correctedStatusAfterValid: correctedPaid.status,
    };
  }
  try {
  const heightBefore = await nivyr.chainHeight();
  const recipient = await nivyr.wallet({ name: `recipient-${randomUUID().slice(0, 12)}`, birthday: heightBefore });
  const memo = `NIVYR-${randomUUID().slice(0, 12)}`;
  const startedAt = Date.now();
  const txid = await nivyr.pay({ from: sender, to: recipient, amount: "0.01", memo, minConfirmations: 1 });
  const broadcast = await nivyr.transaction(txid);
  if (!broadcast.broadcast || broadcast.mined) throw new Error("Broadcast boundary was not observed before mining.");
  if (await nivyr.received(recipient, txid)) throw new Error("Recipient wallet detected payment before explicit sync.");
  await nivyr.mine(1);
  const mined = await nivyr.waitForTransaction(txid, (tx) => tx.mined);
  await nivyr.waitForIndexer(mined.height!);
  await nivyr.sync(sender);
  const beforeSync = await nivyr.observeWallet(recipient, txid);
  if (beforeSync.detected) throw new Error("Recipient wallet was not unscanned after indexer convergence.");
  await nivyr.sync(recipient);
  const detected = await nivyr.observeWallet(recipient, txid);
  if (!detected.detected || detected.payment?.memo !== null) throw new Error("Sync did not expose the payment while preserving memo enhancement boundary.");
  await nivyr.enhance(recipient);
  const enhanced = await nivyr.observeWallet(recipient, txid);
  if (enhanced.payment?.memo !== memo) throw new Error("Wallet enhancement did not expose the expected memo.");
  const indexedHeight = await nivyr.indexedHeight();
  const evidence = {
    schema: 1,
    observedAt: new Date().toISOString(),
    packageVersion: "0.1.0",
    txid,
    chainHeightBefore: heightBefore,
    minedHeight: mined.height,
    indexedHeight,
    transitions: { broadcast: true, mined: mined.mined, indexed: indexedHeight >= mined.height!, merchantUnscanned: !beforeSync.detected, synced: true, detected: detected.detected, enhanced: true, memoAvailable: enhanced.payment?.memo === memo },
    durationMs: Date.now() - startedAt,
  };
  const evidenceDir = join(runtimeRoot, "evidence");
  await mkdir(evidenceDir, { recursive: true, mode: 0o700 });
  const evidencePath = join(evidenceDir, `lifecycle-${Date.now()}.json`);
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  const memoAdapterEvidence = await runForgedTxidScenario("memo");
  const destinationAdapterEvidence = await runForgedTxidScenario("destination");
  const forgeEvidence = {
    schema: 1, observedAt: new Date().toISOString(), packageVersion: "0.1.0", applications: [memoAdapterEvidence, destinationAdapterEvidence],
  };
  await writeFile(join(evidenceDir, `forge-txid-${Date.now()}.json`), `${JSON.stringify(forgeEvidence, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  await writeFile(join(evidenceDir, `adapter-reuse-${Date.now()}.json`), `${JSON.stringify({ schema: 1, observedAt: forgeEvidence.observedAt, packageVersion: "0.1.0", sameScenarioMachinery: true, applications: [memoAdapterEvidence.applicationPattern, destinationAdapterEvidence.applicationPattern], bothSettledExpectedPayments: true }, null, 2)}\n`, { mode: 0o600, flag: "wx" });
  process.stdout.write(`${JSON.stringify({ status: "PASS", evidence: evidencePath, forgeTxid: forgeEvidence, ...evidence }, null, 2)}\n`);
  } finally {
    app.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`[nivyr] LIFECYCLE_FAILURE: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
