# Types and adapters

## `WalletRef`

```ts
interface WalletRef {
  readonly name: string;
  readonly directory: string;
  readonly identityFile: string;
  readonly accountId: string;
  readonly address: string;
}
```

`directory` and `identityFile` are local runtime paths. Do not expose them in public logs or evidence.

## `TransactionObservation`

Includes `txid`, `version`, `broadcast`, `mined`, `height`, `confirmations`, `blockHash`, and counts for transparent inputs/outputs, Sapling spends/outputs, Orchard actions, and Ironwood actions. `height` and `blockHash` may be `null`.

## `WalletObservation` and `DetectedPayment`

`WalletObservation` contains:

- `detected: boolean`
- `minedHeight: number | null`
- `scanHeight: number | null`
- `payment: DetectedPayment | null`

`DetectedPayment` contains `txid`, `minedHeight`, `amountZatoshi: bigint`, `pool` (`"sapling" | "orchard" | "ironwood"`), and `memo: string | null`.

JavaScript `bigint` is not directly JSON serializable. Convert `amountZatoshi` to a decimal string before writing JSON evidence.

## `PaymentAppAdapter`

```ts
interface InvoiceRef {
  readonly id: string;
  readonly amount: string;
  readonly reference: string;
  readonly destination: string;
}

interface InvoiceState extends InvoiceRef {
  readonly status: string;
}

interface PaymentAppAdapter {
  createInvoice(input: {
    amount: string;
    reference: string;
    destination?: string;
  }): Promise<InvoiceRef>;

  getInvoice(id: string): Promise<InvoiceState>;
}
```

This is a small API-facing contract. Implement it with the application’s real public HTTP/API behavior. The package does not ship an application server or inspect databases.

### `createPaymentInvoice(adapter, input)`

Calls `adapter.createInvoice(input)` and returns the resulting `InvoiceRef`.

## `zecToZatoshi(value)`

Converts a non-negative decimal ZEC string with up to eight decimal places to a `bigint` zatoshi value. For example:

```ts
import { zecToZatoshi } from "@webghost01/nivyr";

zecToZatoshi("0.01"); // 1000000n
```

Inputs with signs, separators, excess precision, or non-decimal characters are rejected.

## Wallet backend types

`WalletBackend` exports the small command interface:

```ts
interface WalletBackend {
  execute(args: readonly string[], timeoutMs?: number): Promise<{
    stdout: string;
    stderr: string;
  }>;
}
```

`ContainerDevtoolBackend`, `LocalDevtoolBackend`, and `CommandError` are also package exports for maintainers and custom integrations. The default package runtime uses the pinned container backend. These are wallet command adapters, not a general-purpose wallet SDK.
