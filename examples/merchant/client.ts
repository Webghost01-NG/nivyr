import type { Invoice } from "./server.js";

export class MerchantClient {
  constructor(private readonly baseUrl = "http://127.0.0.1:8787") {}

  async createInvoice(input: Pick<Invoice, "amount" | "ref" | "address">): Promise<Invoice> {
    return this.request<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async observe(id: string, observation: unknown): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}/observation`, {
      method: "POST",
      body: JSON.stringify(observation),
    });
  }

  async invoice(id: string): Promise<Invoice> {
    return this.request<Invoice>(`/invoices/${id}`);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
    if (!response.ok) throw new Error(`Merchant API returned ${response.status}: ${await response.text()}`);
    return (await response.json()) as T;
  }
}
