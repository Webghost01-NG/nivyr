export interface InvoiceRef {
  readonly id: string;
  readonly amount: string;
  readonly reference: string;
  readonly destination: string;
}

export interface InvoiceState extends InvoiceRef {
  readonly status: string;
}

/** Public application surface; implementations should use HTTP/API behavior only. */
export interface PaymentAppAdapter {
  createInvoice(input: { amount: string; reference: string; destination?: string }): Promise<InvoiceRef>;
  getInvoice(id: string): Promise<InvoiceState>;
}

export async function createPaymentInvoice(
  adapter: PaymentAppAdapter,
  input: { amount: string; reference: string; destination?: string },
): Promise<InvoiceRef> {
  return adapter.createInvoice(input);
}
