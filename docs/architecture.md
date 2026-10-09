# Architecture

Nivyr is an installable TypeScript SDK and CLI for integration-testing Zcash payment applications. It coordinates a disposable local regtest and exposes payment lifecycle observations to a consumer's test runner and application API. Nivyr does not implement consensus, transaction cryptography, indexing, wallet scanning, or a general-purpose test runner.

The public package (`@webghost01/nivyr`) ships the Compose and runtime configuration it needs. It stores runtime state under the consuming project's `.nivyr/` directory and uses a digest-pinned wallet-tool container in normal image mode. A source checkout, Rust, and Cargo are not required for the normal package path. A local devtool executable remains available as a maintainer/custom-runtime option.

## Components

| Component | Responsibility |
|---|---|
| Consumer application/test | Creates invoices and asserts application state through public HTTP/API behavior; it may use Vitest or another Node test runner. |
| Nivyr CLI and SDK | Starts/stops its project-scoped runtime, controls lifecycle actions, and exposes observations and a small `PaymentAppAdapter` contract. |
| Zebra | Provides the local chain and JSON-RPC observations, including transaction state and mining. |
| Zaino | Provides independently observed indexer height and wallet sync transport. |
| Pinned `zcash-devtool` container | Creates and operates disposable wallets, sends transactions, syncs transactions, and enhances transaction data to reveal memos. |
| Regtest configuration | Provides an isolated local chain with NU6.3 active at the configured activation height; funds are disposable local regtest funds. |

Nivyr orchestrates these existing Zcash components. It does not replace them. The wallet image used by the released package is pinned by digest and targets `linux/amd64`; see [image provenance](evidence/devtool-image.json) and [public package acceptance](evidence/public-npm-release.json).

## Lifecycle knowledge boundaries

Chain, indexer, wallet, and application observations are separate. The released package's verified scenario follows this shape:

```text
broadcast → mined → indexed → merchant wallet unscanned
→ explicit sync → detected → enhanced → memo available
```

| State | Observer / signal | What it does not establish |
|---|---|---|
| `broadcast` | Zebra returns transaction data before it is in an active block. | It does not establish mining, indexing, scanning, or settlement. |
| `mined` | Zebra reports active-chain height and confirmations. | It does not establish indexer convergence or wallet scanning. |
| `indexed` | Zaino's reported height reaches the mined transaction height. | It does not establish that the merchant wallet has scanned the transaction. |
| `recipient-unscanned` | A fresh recipient wallet has no transaction record before explicit sync. | It does not mean the chain or indexer is unaware of the transaction. |
| `payment-detected` | After sync, the wallet transaction list contains the transaction. | It does not establish memo availability or correct application settlement. |
| `memo-available` | After enhancement, wallet transaction details expose the plaintext memo. | It does not establish that an invoice's amount/destination policy is satisfied. |
| application settlement | The application reports invoice status through its public API. | A mined txid alone is not evidence of expected recipient, amount, or memo. |

`waitForTransaction()` observes Zebra transaction state; `waitForIndexer()` separately waits for Zaino's indexed height. The tests deliberately withhold recipient sync until both boundaries have been observed. If the wallet CLI provides no scan range, Nivyr records a conservative lower bound from the indexer height sampled before sync rather than claiming an independently measured wallet scan height.

## Application testing and security regression

`PaymentAppAdapter` exposes invoice creation and retrieval so scenario code can exercise an application through public behavior without reading its database. The current packaged scenarios pass against two local reference API patterns: memo-based invoice reconciliation and per-invoice destination reconciliation. They are fixtures, not third-party production integrations.

The forged-txid regression demonstrates that an included buggy fixture can settle an invoice when it checks only that a supplied transaction exists and is mined. The corrected reference flow requires its wallet to observe the invoice's expected payment semantics. This does not establish a vulnerability in any outside merchant. See [forged-txid evidence](evidence/packaged-forged-txid.json) and [adapter reuse evidence](evidence/adapter-reuse.json).

## Runtime boundaries and evidence

`npx nivyr up` runs preflight, starts Nivyr-owned pinned containers, prepares the disposable regtest sender, and records READY state. `npx nivyr test` runs Nivyr's packaged lifecycle and reference security suite; consumers use the TypeScript API from their own runner for app-specific tests. `npx nivyr down` stops only the Nivyr-owned Compose project and preserves its wallet and volumes.

The public registry install and full CLI flow have reproducible evidence on Fedora Linux 44 x86_64. Ubuntu and macOS success has been reported by the project owner, but exact environment details and logs were not found; those reports are not yet reproducible or treated as verified support. See the [support matrix](support-matrix.md), [public npm acceptance](evidence/public-npm-release.json), and [packaged lifecycle](evidence/packaged-lifecycle-20261003.json).
