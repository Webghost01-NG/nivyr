import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

export interface Invoice {
  id: string;
  amount: string;
  ref: string;
  address: string;
  status: "unpaid" | "paid";
}

interface PaymentObservation {
  mined: boolean;
  recipientDetected: boolean;
  amountZatoshi: string | null;
  memo: string | null;
}

const invoices = new Map<string, Invoice>();

function send(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (request.method === "POST" && url.pathname === "/invoices") {
    const body = await readJson(request);
    if (typeof body.amount !== "string" || typeof body.ref !== "string" || typeof body.address !== "string") {
      send(response, 400, { error: "amount, ref and address are required strings" });
      return;
    }
    const invoice: Invoice = {
      id: randomUUID(),
      amount: body.amount,
      ref: body.ref,
      address: body.address,
      status: "unpaid",
    };
    invoices.set(invoice.id, invoice);
    send(response, 201, invoice);
    return;
  }

  const match = url.pathname.match(/^\/invoices\/([^/]+)(?:\/observation)?$/);
  if (!match) {
    send(response, 404, { error: "not found" });
    return;
  }
  const invoice = invoices.get(match[1]!);
  if (!invoice) {
    send(response, 404, { error: "invoice not found" });
    return;
  }

  if (request.method === "POST" && url.pathname.endsWith("/observation")) {
    const observation = (await readJson(request)) as unknown as PaymentObservation;
    if (
      observation.mined &&
      observation.recipientDetected &&
      observation.amountZatoshi === zecToZatoshi(invoice.amount).toString() &&
      observation.memo === invoice.ref
    ) {
      invoice.status = "paid";
    }
    send(response, 200, invoice);
    return;
  }
  if (request.method === "GET") {
    send(response, 200, invoice);
    return;
  }
  send(response, 405, { error: "method not allowed" });
});

const port = Number(process.env.MERCHANT_PORT ?? "8787");
server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`merchant listening on http://127.0.0.1:${port}\n`);
});

async function readJson(request: import("node:http").IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function zecToZatoshi(value: string): bigint {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value)) throw new Error("Invalid invoice amount");
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, "0"));
}
