# Getting started

This guide installs Nivyr in a normal Node project, starts its pinned local runtime, runs the packaged lifecycle verification, and shuts it down safely.

> **Release status:** the `0.1.0` package passed external tarball acceptance, but public npm publication is still pending registry write authorization. The `npm install` command below will resolve once publication is complete.

## Prerequisites

- Node.js `^22.12.0 || ^24.0.0 || >=26.0.0` and npm.
- Docker CLI, a running Docker daemon, and Docker Compose v2.24.4 or newer.
- Internet access to pull the pinned Docker images.
- The ports `49232`, `49080`, `49137`, and `49237` available.
- At least 8 GiB free disk is recommended. Doctor reports disk space as an advisory.

The end-to-end verified host is Fedora Linux 44 x86_64. Other hosts are listed as unverified in [platform support](/reference/platforms). The wallet image is `linux/amd64`. Normal image mode does not require Git, Rust, or Cargo.

## Install

From the root of your application project:

```sh
npm install -D @webghost01/nivyr
```

## Check the host

```sh
npx nivyr doctor
```

Doctor checks Node, npm, Docker, Compose, ports, writable runtime storage, available disk, image-registry reachability, and the wallet image architecture. A disk warning is advisory; missing Docker, a stopped daemon, missing Compose, unsupported architecture, or occupied ports blocks startup.

## Start and verify

```sh
npx nivyr up
npx nivyr test
```

`up` runs preflight before pulling images or creating runtime state. It starts the pinned Zebra, Zaino, and wallet tooling, prepares a funded disposable sender on regtest, and marks the project ready after wallet and indexer readiness checks pass.

`test` verifies Nivyr’s packaged lifecycle and its two reference forged-txid patterns. It does not replace your project’s test runner. Use the TypeScript API from Vitest or another Node test framework for application-specific assertions.

## Stop safely

```sh
npx nivyr down
```

Shutdown stops only this project’s Nivyr-owned Compose resources. It preserves the Nivyr runtime wallet and Docker volumes so a later `up` can reuse them. Runtime data lives in your project’s `.nivyr/` directory, outside `node_modules`.

## TypeScript quick start

Run `npx nivyr up` once, then use the managed sender in a test:

```ts
import { createNivyr } from "@webghost01/nivyr";

const zcash = createNivyr();
const sender = await zcash.managedSender();
const merchant = await zcash.wallet({ name: "merchant-invoice-42" });
const txid = await zcash.pay({
  from: sender,
  to: merchant,
  amount: "0.01",
  memo: "INVOICE-42",
  minConfirmations: 1,
});

await zcash.mine(1);
await zcash.sync(merchant);
await zcash.enhance(merchant);
const observation = await zcash.observeWallet(merchant, txid);
```

For the full assertion sequence, see [Write a first lifecycle test](/guide/first-lifecycle-test).

## Runtime location

Nivyr writes project-owned runtime state to `.nivyr/`. It writes an ownership marker and uses a deterministic Compose project name for that consumer project. Do not move or hand-edit wallet state while the runtime is active. See [Runtime and Docker](/concepts/runtime).
