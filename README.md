# Nivyr

Nivyr is a small TypeScript companion for Vitest that creates and observes real shielded Zcash lifecycle states against a local regtest stack. It coordinates `zcash-devtool`, Zebra RPC, and Zaino's JSON-RPC surface; it does not implement consensus, wallet cryptography, indexing, or a test runner.

The first verified capability is a payment lifecycle with current NU6.3/Ironwood transactions:

```text
broadcast → mined → indexed → recipient sync detects amount → wallet enhancement exposes memo
```

The recipient can remain deliberately unscanned between mining and explicit `sync()`. This enables application tests to distinguish chain confirmation from wallet observation. The competitive research is in [docs/landscape.md](docs/landscape.md); implementation limits are in [docs/limitations.md](docs/limitations.md).

## Verified stack

- Z3 commit `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`
- Zebra `6.2.3` (`zfnd/zebra:6.2.3`)
- Zaino `0.10.1-no-tls`, pinned by digest in the [environment record](docs/spike/environment.md). Z3's default `0.6.0` image does not accept the current wallet's Ironwood protocol requests.
- `zcash-devtool` commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`, built with `regtest_support`
- Regtest activates NU6.3 at height 2.

Observed payments used transaction version 6 and Ironwood actions, with no Orchard, Sapling, or transparent components. See [pool proof](docs/evidence/pool-proof.txt) and repeatable Vitest evidence at [repeatability.json](docs/evidence/runs/repeatability.json).

## Quickstart

Requirements: Node.js 22.23.1+, npm, Docker Engine and Compose, plus a local Z3 regtest stack using the versions above. The stack must be started with the pinned Zaino 0.10.1 image override. A regtest sender wallet with spendable shielded balance must exist. The second-machine run is still unverified.

When starting the Z3 indexer service, set `Z3_ZAINO_IMAGE` to the full pinned reference from `docs/spike/environment.md`; Z3's default image is too old for Ironwood wallet sync. The integration test assumes the sender wallet has already been funded and shielded on this local regtest chain.

Install dependencies and set the paths for your local environment:

```sh
npm ci
export NIVYR_DEVTOOL=/path/to/zcash-devtool
export NIVYR_ACTIVATION_HEIGHTS="$PWD/config/regtest-activation-heights.toml"
export NIVYR_SENDER_WALLET=/path/to/regtest/sender-wallet
export NIVYR_SENDER_IDENTITY=/path/to/regtest/sender.age
export NIVYR_RUNTIME_ROOT="$PWD/.cache/runtime"
export NIVYR_EVIDENCE_DIR="$PWD/docs/evidence/runs"
```

Run the pure unit tests and the real integration scenario:

```sh
npm test
npm run typecheck
npm run test:integration
```

The integration test creates disposable recipient wallets, sends three real Ironwood payments, records pre-mine/post-mine and pre-sync/post-sync states, and checks a tiny merchant service only through HTTP. Runtime wallet files and credentials stay under ignored `.cache/` paths; evidence contains no seeds or private keys.

## API example

```ts
import { createNivyr } from "nivyr";

const zcash = createNivyr({
  devtoolPath: process.env.NIVYR_DEVTOOL!,
  walletRoot: ".cache/runtime/wallets",
  activationHeightsPath: "config/regtest-activation-heights.toml",
});

const alice = await zcash.openWallet("Alice", senderDirectory, senderIdentity);
const bob = await zcash.wallet({ name: "Bob" });
const txid = await zcash.pay({ from: alice, to: bob, amount: "2", memo: "ORDER-42" });

const pending = await zcash.transaction(txid);
await zcash.mine(1);
const mined = await zcash.waitForTransaction(txid, (tx) => tx.mined);
await zcash.waitForIndexer(mined.height!);
expect(await zcash.received(bob, txid)).toBe(false);
await zcash.sync(bob);
expect((await zcash.observeWallet(bob, txid)).detected).toBe(true);
await zcash.enhance(bob);
expect((await zcash.observeWallet(bob, txid)).payment?.memo).toBe("ORDER-42");
```

The sender needs spendable test funds first. Transaction construction selects the pool from wallet consensus rules; Nivyr reports the observed pool components instead of promising a pool based on the address label. `sync()` detects the payment and amount. `enhance()` asks the wallet to fetch full transaction data; the wallet performs memo decryption.

## Application behavior

The example merchant is a minimal HTTP-only reference application in `examples/merchant`. Its regression scenario catches an app that marks an invoice paid at mined time, before the recipient wallet scans the payment. It then checks exact amount and memo handling, including a mismatched memo. Nivyr does not access the application's database.

## Scope

Nivyr owns only tested lifecycle orchestration and observation: block mining, transaction state, independent indexer height, explicit wallet sync, wallet detection, and memo availability after enhancement. Vitest remains the test runner. Z3/Zebra/Zaino and `zcash-devtool` remain the infrastructure and cryptographic implementations.

See [architecture](docs/architecture.md), [spike report](docs/spike/spike-report.md), and [known limitations](docs/limitations.md).
