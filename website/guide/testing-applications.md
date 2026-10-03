# Testing payment applications

Nivyr is a companion to the application test runner. It supplies real regtest payments and lifecycle observations; your test calls the application through the interface it exposes, such as HTTP or an SDK. It does not inspect the application's database.

## The adapter contract

The package exports this minimal public surface:

```ts
export interface PaymentAppAdapter {
  createInvoice(input: {
    amount: string;
    reference: string;
    destination?: string;
  }): Promise<InvoiceRef>;

  getInvoice(id: string): Promise<InvoiceState>;
}
```

`InvoiceRef` contains `id`, `amount`, `reference`, and `destination`. `InvoiceState` adds a `status: string`. The adapter is an application-facing contract, not a built-in HTTP client; implement it using your app’s public API.

The helper `createPaymentInvoice(adapter, input)` delegates to `adapter.createInvoice(input)` and returns an `InvoiceRef`.

## Keep the app a black box

The test should create and read an invoice through public behavior. Use Nivyr to create the chain event and wallet observation, then submit the observation through the app's supported payment API. Assert the public invoice status returned by the app.

```ts
const invoice = await app.createInvoice({
  amount: "0.01",
  reference: "ORDER-42",
  destination: merchant.address,
});

// Create, mine, index, sync, and enhance the payment with Nivyr.
// Then use the application's public claim/reconciliation API.
const state = await app.getInvoice(invoice.id);
expect(state.status).toBe("paid");
```

This snippet shows the adapter boundary; replace the comment with the actual public payment endpoint used by your application. Nivyr does not define a universal settlement API.

## What reuse is verified

The same packaged scenario machinery has passed against two local reference API patterns: memo-based invoice reconciliation and per-invoice destination reconciliation. They are fixtures, not two independent production applications. See [Adapter patterns](/guide/adapter-patterns) and the [evidence summary](/reference/evidence).
