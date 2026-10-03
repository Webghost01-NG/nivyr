# Nivyr

Integration-testing infrastructure for Zcash payment applications.

> A mined Zcash payment is not a scanned, detected, enhanced, or settled payment.

Nivyr lets developers reproduce the gaps between chain knowledge, indexer knowledge, wallet knowledge, and application knowledge using real local Zcash infrastructure. It sits above Zebra, Zaino, and a Zcash wallet implementation; it does not replace a wallet, node, indexer, devnet, or general test runner.

## Problem

Payment code often sees a valid mined txid before the merchant wallet has scanned it. That fact alone does not establish that this invoice received the expected amount or memo.

## Insight

`broadcast → mined → indexed → merchant wallet unscanned → explicit sync → detected → enhancement → memo available`

Each observer has separate knowledge. Nivyr exposes those boundaries to application tests.

## What Nivyr Does

- Runs a local, disposable Zcash regtest using pinned infrastructure.
- Creates real payments and exposes broadcast/mining/indexer/wallet lifecycle observations.
- Lets tests hold the recipient wallet unscanned, then explicitly sync and enhance it.
- Keeps the application a black box through public HTTP/API adapters.

Vitest remains the test runner. `nivyr test` is intended to verify Nivyr's packaged lifecycle, not replace a user's test runner.

## Forged-Txid Demo

A valid mined txid alone does not prove that a merchant received the expected payment. The current reference merchant checks wallet observation, exact amount, and memo through its HTTP surface. The dedicated customer-supplied forged-txid security regression is still pending; see [evidence](docs/evidence/forge-txid.json). Do not claim the attack is reproduced until that artifact is updated by a real run.

## Lifecycle Model

Nivyr's verified source-checkout lifecycle uses real Ironwood-era transactions:

```text
broadcast → mined → indexed → merchant wallet unscanned → sync → detected → enhance → memo
```

The source-checkout evidence is not yet evidence that the npm package runtime works. See [architecture](docs/architecture.md), [limitations](docs/limitations.md), and [host evidence](docs/support-matrix.md).

## Install

The package is prepared as `@webghost01/nivyr@0.1.0`, but has **not been published**. Until package acceptance gates pass, install from a local tarball built by a maintainer:

```sh
npm pack /path/to/nivyr
npm install -D /path/to/webghost01-nivyr-0.1.0.tgz
```

After publication, the intended install is:

```sh
npm install -D @webghost01/nivyr
```

## Quickstart

The package CLI and doctor are under active productization. Do not treat the following as a verified end-to-end quickstart yet:

```sh
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

Normal mode is designed to use pinned Docker images without local Rust/Cargo compilation. The pinned devtool image is not yet published; the image-mode bootstrap is therefore not ready for users.

## TypeScript API

```ts
import { createNivyr } from "@webghost01/nivyr";

const zcash = createNivyr();
const recipient = await zcash.wallet({ name: "merchant-order-42" });
// Use a sender wallet from the managed Nivyr runtime in a complete setup.
```

Explicit paths remain supported for maintainer and custom-runtime use:

```ts
const zcash = createNivyr({
  devtoolPath: process.env.NIVYR_DEVTOOL,
  walletRoot: ".nivyr/wallets",
  activationHeightsPath: "node_modules/@webghost01/nivyr/config/regtest-activation-heights.toml",
});
```

The package exports `createNivyr`, `Nivyr`, lifecycle types, payment adapter types, and `zecToZatoshi`.

## Application Adapter

`PaymentAppAdapter` is a small HTTP/API-facing contract with `createInvoice` and `getInvoice`. It does not authorize database access. The existing merchant demonstrates memo-based invoice reconciliation. Adapter reuse across two distinct applications is not yet proven; see [adapter evidence](docs/evidence/adapter-reuse.json).

## Architecture

Zebra provides chain state; Zaino provides indexing and wallet sync transport; zcash-devtool provides wallet operations and memo decryption. Nivyr coordinates these existing components and asserts application-visible behavior. The source-checkout bootstrap still uses the prior repository scripts; package runtime orchestration is incomplete.

## Reproducibility

Verified source pins: Z3 `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`, Zebra `6.2.3`, Zaino `0.10.1-no-tls`, zcash-devtool `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`; NU6.3 activates at regtest height 2. Zebra and Zaino image digests are recorded in [stack proof](docs/evidence/stack-proof.json).

Package runtimes will use `.nivyr/` in the consumer project with an ownership marker, private wallet storage, and project-scoped Docker resources. Do not delete unrelated Docker containers or volumes. Current package path needs further bootstrap/restart verification.

## Evidence

- [Existing real lifecycle evidence](docs/evidence/runs/repeatability.json)
- [Ironwood pool proof](docs/evidence/pool-proof.txt)
- [Sanitized bootstrap evidence](docs/evidence/bootstrap/)
- [Host support matrix](docs/support-matrix.md)
- [Package cold start](docs/evidence/cold-start.json) and [20-run reliability](docs/evidence/reliability.json): pending

## Supported Platforms

Linux x86_64 is the only host with verified source-checkout lifecycle evidence. macOS Node gating, Ubuntu source-build network failure, and secondary Fedora missing Docker CLI are separate historical reports. The package uses a linux/amd64 devtool image; ARM64 is not supported until an ARM64 image is built and tested.

## Known Limitations

- The npm tarball still requires external acceptance, and the package CLI runtime is incomplete.
- GHCR image workflow exists but no image tag/digest has been published or verified.
- Forged-txid regression, two-app adapter reuse, view-only merchant, and reorg are pending/not tested.
- No external developer validation is recorded.
- Wallet CLI parsing still depends on pinned human-readable output in some paths.

## Existing Zcash Infrastructure

Nivyr sits above Zcash infrastructure instead of implementing consensus, transaction construction, indexing, wallet cryptography, or a node. It coordinates pinned Zebra/Zaino and a wallet backend so applications can test payment lifecycle behavior.

## Validation

No third-party interviews or installations are recorded. Use [the validation form](docs/validation.md); do not convert maintainer testing into traction claims.

## Roadmap

Local npm package → reusable payment scenarios → CI support → hosted ephemeral environments → compatibility/regression platform. These are roadmap directions, not shipped features.

## Colosseum

Initial market: Zcash payment developers. A practical GTM path is npm discovery and GitHub examples, posts in the Zcash Forum and ecosystem developer communities, direct integration outreach to payment and wallet teams, and relevant grants/ecosystem programs; make the first install and lifecycle example easy to reproduce. Current criteria/evidence mapping is in [docs/colosseum-criteria.md](docs/colosseum-criteria.md). No demand or traction is claimed.

## Development

```sh
npm ci
npm run typecheck
npm test
npm run build
```

The source-checkout lifecycle scripts and preserved-state evidence are described in [NEXT.md](NEXT.md) and [bootstrap plan](docs/bootstrap-plan.md). Keep wallet state and secrets under ignored local runtime paths. No public npm publication or merge has been performed.
