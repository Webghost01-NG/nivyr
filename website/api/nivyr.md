# `Nivyr` methods

## Create a client

```ts
import { createNivyr } from "@webghost01/nivyr";

const zcash = createNivyr();
```

`createNivyr(options?: NivyrOptions): Nivyr` returns a new client. In the normal package mode, the installed package selects the digest-pinned wallet container and localhost RPC endpoints.

## Wallets

### `wallet(options)`

Creates and initializes a regtest wallet, then returns its public reference:

```ts
const merchant = await zcash.wallet({ name: "merchant-order-42" });
console.log(merchant.address);
```

Options: `name` is required. `directory`, `identityFile`, and `birthday` are optional maintainer overrides. The returned `WalletRef` includes `name`, `directory`, `identityFile`, `accountId`, and `address`. Treat identity/runtime paths as private local state; do not publish them in logs or evidence.

### `openWallet(name, directory, identityFile)`

Opens an existing wallet directory and returns a `WalletRef`. Package consumers usually use `managedSender()` for the runtime-funded sender.

### `managedSender()`

Opens the managed sender created by `npx nivyr up`. It throws if runtime state is missing, not ready, or points outside the configured wallet root.

## Payments and chain observations

### `pay(options)`

Sends a payment and returns its transaction ID:

```ts
const txid = await zcash.pay({
  from: sender,
  to: merchant, // WalletRef or a Zcash address string
  amount: "0.01", // decimal ZEC string, up to 8 decimal places
  memo: "ORDER-42",
  minConfirmations: 1,
});
```

`PayOptions` requires `from`, `to`, and `amount`. `memo` and `minConfirmations` are optional.

### `mine(blocks = 1)`

Generates the requested number of local regtest blocks and returns block hashes.

### `transaction(txid)`

Returns a `TransactionObservation` with the txid, `broadcast`, `mined`, height, confirmations, block hash, transaction version, and pool/input/output counts. `height` and `blockHash` are `null` when unavailable.

### `chainHeight()` and `indexedHeight()`

Return the current Zebra chain height and Zaino indexer height respectively. They are separate observations.

## Waits

### `waitForTransaction(txid, predicate)`

Polls `transaction(txid)` until the async predicate returns true or the configured timeout expires. It returns the matching observation.

### `waitForIndexer(height)`

Polls until the indexed height is at least the supplied block height.

### `wait(check, description)`

Polls an async boolean check using the client’s configured `pollIntervalMs` and `timeoutMs`. It includes the description in timeout errors.

## Wallet observations

### `received(wallet, txid)`

Returns whether the wallet’s transaction list contains the txid. It does not sync the wallet.

### `sync(wallet)`

Runs wallet sync against the configured lightwalletd endpoint and records the observed or conservative scan height.

### `observeWallet(wallet, txid)`

Returns a `WalletObservation`: `detected`, `minedHeight`, `scanHeight`, and `payment`. `payment` is `null` when the wallet has not detected the txid or parsed payment details.

### `enhance(wallet)`

Runs the wallet enhancement operation. In the verified lifecycle flow this makes the memo available for inspection.

## Options

`NivyrOptions` supports:

| Option | Type | Purpose |
| --- | --- | --- |
| `devtoolPath` | `string` | Selects local devtool execution; maintainer/custom-runtime use. |
| `walletRoot` | `string` | Overrides the local wallet directory root. |
| `activationHeightsPath` | `string` | Overrides the regtest activation configuration path. |
| `lightwalletdAddress` | `string` | Overrides the wallet sync endpoint. |
| `zebraRpcUrl` | `string` | Overrides Zebra RPC. |
| `zainoRpcUrl` | `string` | Overrides the Zaino RPC endpoint used for indexed height. |
| `zebraRpcUser` / `zebraRpcPassword` | `string` | Overrides local Zebra RPC credentials. |
| `pollIntervalMs` / `timeoutMs` | `number` | Controls polling and wait timeout behavior. |
| `walletBackend` | `WalletBackend` | Supplies a wallet command backend. |

Supplying a local `devtoolPath` selects the local backend path. Normal package users should leave these advanced options unset and use the image-backed runtime.
