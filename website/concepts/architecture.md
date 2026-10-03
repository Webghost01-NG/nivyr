# Architecture

Nivyr sits between a test/application and existing Zcash development infrastructure. It coordinates lifecycle actions and observations; Zebra, Zaino, and the wallet implementation continue to do their own jobs.

![Nivyr architecture: Vitest or an application API calls the Nivyr TypeScript API and CLI; Nivyr coordinates Zebra, Zaino, and a pinned wallet container on disposable regtest.](/architecture.svg)

## Components

- **Application and test:** the developer’s TypeScript/Vitest test and, when present, the merchant application’s public API.
- **Nivyr package:** the CLI and `createNivyr()` API orchestrate real payment steps and return observations. `PaymentAppAdapter` describes the small public application boundary used by the reference scenarios.
- **Zebra:** validates and serves the local regtest chain through its RPC interface.
- **Zaino:** indexes the chain and serves wallet sync data over its regtest endpoints.
- **zcash-devtool:** the pinned wallet implementation creates wallets, sends payments, syncs transactions, and enhances memo data.
- **Regtest:** an isolated local network with disposable funds and NU6.3 active at height 2 in the pinned configuration.

## Boundaries

Nivyr does not implement Zcash consensus, transaction cryptography, wallet scanning, indexing, or the test runner. Vitest remains the test runner. Nivyr provides the controls and assertions that connect these layers to application behavior.

The packaged wallet container uses the Zaino network namespace to reach its local plaintext h2c service. Wallet state is mounted from the consuming project’s `.nivyr/` directory; it is not stored in the package’s `node_modules`.

See [runtime details](/concepts/runtime) and the [stack pins and evidence](/reference/evidence).
