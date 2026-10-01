interface RpcResponse<T> {
  readonly result?: T;
  readonly error?: { readonly code: number; readonly message: string };
}

export class ZebraRpc {
  private id = 0;

  constructor(
    private readonly url: string,
    private readonly user?: string,
    private readonly password?: string,
  ) {}

  async call<T>(method: string, params: readonly unknown[] = []): Promise<T> {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (this.user !== undefined && this.password !== undefined) {
      headers.authorization = `Basic ${Buffer.from(`${this.user}:${this.password}`).toString("base64")}`;
    }
    const response = await fetch(this.url, {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", id: ++this.id, method, params }),
    });
    if (!response.ok) throw new Error(`Zebra RPC ${method} returned HTTP ${response.status}`);
    const payload = (await response.json()) as RpcResponse<T>;
    if (payload.error) {
      throw new Error(`Zebra RPC ${method} failed (${payload.error.code}): ${payload.error.message}`);
    }
    if (!("result" in payload)) throw new Error(`Zebra RPC ${method} returned no result`);
    return payload.result as T;
  }
}
