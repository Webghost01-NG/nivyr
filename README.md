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

A valid mined txid alone does not prove that a merchant received the expected payment. In the packaged regtest, a reference merchant that trusts a customer-supplied mined txid incorrectly settled ORDER-42 for an unrelated destination and wrong memo. The corrected fixture remained unpaid until its wallet observed the expected destination, amount, and memo. See the [sanitized evidence](docs/evidence/packaged-forged-txid.json); this demonstrates the fixture, not any third-party merchant.

## Lifecycle Model

Nivyr's packaged external-project lifecycle uses real Ironwood-era transactions:

```text
broadcast → mined → indexed → merchant wallet unscanned → sync → detected → enhance → memo
```

The packed npm artifact ran this lifecycle from a project with no Nivyr repository checkout. See the [external package acceptance record](docs/evidence/package-acceptance.json), [lifecycle evidence](docs/evidence/packaged-lifecycle-20261003.json), [architecture](docs/architecture.md), and [host evidence](docs/support-matrix.md).

## Install

Install the package into an ordinary project:

```sh
npm install -D @webghost01/nivyr
```

For direct tarball installs, including package acceptance tests:

```sh
npm install -D /path/to/webghost01-nivyr-0.1.0.tgz
```

## Quickstart

The full CLI sequence has passed on the Fedora Linux 44 x86_64 productization host using an external package installation:

```sh
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

Normal mode defaults to the published, digest-pinned linux/amd64 wallet image. The tested `up` run used Cargo and Rust trap wrappers whose invocation log stayed empty. An available Docker/Compose host and registry access are required; ARM64 has not been tested.

## TypeScript API

```ts
import { createNivyr } from "@webghost01/nivyr";

const zcash = createNivyr();
const sender = await zcash.managedSender();
const recipient = await zcash.wallet({ name: "merchant-order-42" });
const txid = await zcash.pay({ from: sender, to: recipient, amount: "0.01", memo: "ORDER-42" });
await zcash.mine(1);
await zcash.sync(recipient);
await zcash.enhance(recipient);
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

`PaymentAppAdapter` is a small HTTP/API-facing contract with `createInvoice` and `getInvoice`. It does not authorize database access. The packaged scenario runs against memo-based and per-invoice-destination reference API patterns; integration with two independent application codebases remains unproven. See [adapter evidence](docs/evidence/adapter-reuse.json).

## Architecture

Zebra provides chain state; Zaino provides indexing and wallet sync transport; the pinned zcash-devtool image provides wallet operations and memo decryption. The package owns generated Compose/runtime state under the consumer project's `.nivyr/`, marked as Nivyr-owned. Wallet containers share only the Zaino network namespace to use its plaintext local h2c endpoint; wallet files remain outside `node_modules`.

## Reproducibility

Verified pins: Z3 `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`, Zebra `6.2.3`, Zaino `0.10.1-no-tls`, zcash-devtool source `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`; NU6.3 activates at regtest height 2. The packaged wallet image is `ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9` (`linux/amd64`). Zebra and Zaino image digests are recorded in [stack proof](docs/evidence/stack-proof.json).

Package runtimes use `.nivyr/` in the consumer project with an ownership marker, private wallet storage, and project-scoped Docker resources. `down` stops only that Nivyr Compose project and preserves its volumes and sender wallet.

## Evidence

- [Existing real lifecycle evidence](docs/evidence/runs/repeatability.json)
- [Ironwood pool proof](docs/evidence/pool-proof.txt)
- [Sanitized bootstrap evidence](docs/evidence/bootstrap/)
- [Host support matrix](docs/support-matrix.md)
- [External tester instructions](docs/third-party-test.md)
- [Package cold-start timing](docs/evidence/cold-start.json): image cache was warm, so no cold-pull claim is made.
- [Packaged reliability](docs/evidence/reliability.json): 20/20 passes on the verified Fedora host.

## Supported Platforms

Fedora Linux 44 x86_64 is verified for external tarball install, doctor, up, test, and down. macOS Node gating, Ubuntu source-build network failure, and secondary Fedora missing Docker CLI remain distinct historical reports; none has a new package-mode retest. The wallet image is linux/amd64; ARM64 is unverified.

## Known Limitations

- A clean-cache image pull and full cold-start timing have not been measured.
- The two application patterns are reference fixtures, not independent third-party applications. View-only merchant and reorg scenarios remain untested.
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

The source-checkout lifecycle scripts and preserved-state evidence are described in [NEXT.md](NEXT.md) and [bootstrap plan](docs/bootstrap-plan.md). Keep wallet state and secrets under ignored local runtime paths.
