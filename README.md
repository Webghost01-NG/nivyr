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

Requirements: Node.js 22.23.1+, npm, Docker Engine with Compose v2.24.4+, `git`, `curl`, and `openssl`. Docker must be running and accessible to your user. First startup fetches pinned Z3 and wallet source as needed, pulls pinned container images, then mines/matures local regtest funds. Mining and shielding took a few minutes in the isolated run; if the pinned wallet binary is not cached, its first Rust build took about 24 minutes on the research machine. Second-machine validation remains **UNVERIFIED**.

```sh
npm ci
npm run nivyr:up
npm run test:integration
npm run nivyr:down
```

`nivyr:up` runs a local regtest-only Z3 stack, verifies NU6.3 activation and indexer readiness, creates/reuses a disposable sender wallet, mines local coinbase rewards, shields them into Ironwood, and checks positive `ironwood_spendable`. No faucet or external ZEC is used. The Z3, Zebra, Zaino and wallet source pins are recorded above and in [environment.md](docs/spike/environment.md). The first wallet build may require Rust/Cargo if the pinned release binary is not already cached. Runtime data, wallet identity and local generated configuration stay in ignored `.cache/` paths. `nivyr:down` stops only Nivyr's Compose project and preserves its volumes/wallet for restart. It does not delete local state.

`npm test`, `npm run typecheck`, and `npm run build` run the unit, TypeScript, and build checks. `npm run test:integration` uses the managed bootstrap configuration; the lifecycle scenario sends real Ironwood transactions and records sanitized run evidence under `docs/evidence/bootstrap/integration/`.

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

See [architecture](docs/architecture.md), [bootstrap plan and verified runtime flow](docs/bootstrap-plan.md), [spike report](docs/spike/spike-report.md), and [known limitations](docs/limitations.md).
