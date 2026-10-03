# Nivyr Engineering Spike

## Verdict

**REPOSITION TO LIFECYCLE LIBRARY**

## Environment

Fedora Linux 44, x86_64, 4 CPUs, 7.6 GiB RAM; Docker 29.8.1, Compose 5.5.1; Node 22.23.1, npm 10.9.8; TypeScript 7.0.2, Vitest 5.0.3; Rust 1.98.0. Full machine and dependency pins are in [environment.md](environment.md).

## Bootstrap verification

**PASS on this host.** A disposable fresh runtime started at height 0 under its own Compose project with a new wallet, mined 100 sender-controlled rewards plus 100 maturity blocks, and shielded the mature funds without a faucet or manual intervention. The resulting version-6 transaction had 4 Ironwood actions, no Orchard/Sapling components, and confirmed at height 203; after sync the wallet had 62,499,480,000 zatoshi spendable in Ironwood. `npm run nivyr:up` and the real integration test passed on the isolated runtime; preserved-state restart reused the wallet and passed integration again. Details and sanitized evidence are in [bootstrap-plan.md](../bootstrap-plan.md) and [bootstrap evidence](../evidence/bootstrap/). Second-machine validation remains **UNVERIFIED**.

## Backend

ZecKit 1.2.0 at `e68d860` was rejected: its documented activation configuration ends at NU6.1 and its tested wallet path is Orchard-specific. Z3 at `e84ce9f` was used with Zebra 6.2.3 and an explicit Zaino 0.10.1 digest override (release source `3244a74`). Z3's default Zaino 0.6 image could not serve the Ironwood subtree request from the current wallet client. No upstream repository was modified.

## Baseline

**PASS.** A 2 ZEC shielded payment with memo `NIVYR-SPIKE-001` reached the recipient wallet. Zebra reported transaction version 6 with two Ironwood actions, zero Orchard/Sapling actions, and zero transparent inputs or outputs. Txid and sanitized details are in [pool-proof.txt](../evidence/pool-proof.txt).

## Memo round trip

**PASS.** The sender wallet encrypted the requested memo as part of a shielded payment. Recipient `sync` detected amount and note. It initially reported zero memos; recipient `enhance` fetched full transaction data, after which the wallet returned plaintext `NIVYR-SPIKE-001`. Wallet cryptography performs decryption.

## Confirmation boundary

Before mining: Zebra returned the txid from its mempool, active-chain false, no mined height, zero confirmations. After `mine(1)`: active-chain true, height 209, one confirmation. Machine-readable records are in [before-mine.json](../evidence/before-mine.json) and [after-mine-before-sync.json](../evidence/after-mine-before-sync.json).

## Scan boundary

**YES.** At height 209, both Zebra and Zaino knew the mined transaction. A newly initialized recipient wallet had no transaction entry and no known scan height. After explicit sync it detected 2 ZEC at height 209. This exact boundary passed in all three automated runs.

## TypeScript experiment

The implemented internal operations are `wallet()`, `openWallet()`, `pay()`, `mine()`, `transaction()`, `waitForTransaction()`, `waitForIndexer()`, `received()`, `observeWallet()`, `sync()`, and `enhance()`. These are experimental helpers, not a published compatibility promise.

## ZecKit + Vitest result

**Not sufficient for the tested modern flow without additional custom work.** The TypeScript layer spans Zebra JSON-RPC, Zaino JSON-RPC and gRPC through the wallet CLI. It normalizes transaction pool components, exact amounts, chain/indexer convergence, unscanned wallet state, and memo enhancement. ZecKit itself did not represent NU6.3/Ironwood. Once pinned compatible infrastructure and the wallet CLI exist, the reusable library remains small and focused; the app's business policy stays in Vitest.

The current reusable TypeScript helper is about 439 production lines (466 including unit tests), covering types, process execution, and output normalization. The integration scenario is 205 lines; the tiny reference app and HTTP client are another 124 lines. It touches Zebra JSON-RPC, Zaino JSON-RPC, Zaino gRPC via `zcash-devtool`, and the wallet CLI. The main reusable complexity is not ordinary `fetch`/`expect`: it is shielded pool proof, the indexer barrier, deterministic unsynced-wallet state, and separating note detection from memo enhancement. The sample app remains plain HTTP state checked by Vitest.

## Friction

1. ZecKit stops at NU6.1 for the inspected current release.
2. Z3's pinned Zaino 0.6 could not understand Ironwood wallet requests.
3. Zebra RPC becoming reachable preceded semantic readiness for mining.
4. Coinbase maturity delayed shielding until 100 blocks after coinbase creation.
5. Wallet scan detects value before enhanced full transaction data exposes memo plaintext.

Details are in [friction-log.md](friction-log.md).

## Timings

Three Vitest repetitions after warm-up: wallet creation 1.7–2.4s; shielded send/broadcast construction 7.8–8.6s; mining 0.8–0.9s; indexer convergence 0.5–1.0s; wallet sync 0.4–0.8s; memo enhancement 0.5–0.7s; scenario through memo enhancement 12.6–13.2s. These are three runs on one host, not a general performance claim. Building `zcash-devtool` took about 24 minutes. Stack cold-start time was not measured from a clean checkout.

## Repeatability

Three of three post-fix integration runs passed real v6 Ironwood transactions, pre-mine and post-mine observation, mined-but-unscanned state, explicit detection, and memo availability after enhancement. The third run used wrong memo `NIVYR-ORDER-69` against expected `NIVYR-ORDER-42`; invoice stayed unpaid. An earlier initial helper had three failures due to a scan-height observation bug, and the red reference app had three expected failures before its settlement bug was fixed. See [repeatability.json](../evidence/runs/repeatability.json) and [demo-red.txt](../evidence/demo-red.txt).

## Second machine

**INDEPENDENT RETEST PENDING; current attempts BLOCKED.** Ubuntu PC #2 (user report) completed `npm ci` and pinned source fetch, then Cargo timed out fetching the `minicbor` crates.io dependency after 30s; READY was not reached. macOS PC #3 (user report) used Node 22.14.0/npm 10.9.2; `npm ci` warned EBADENGINE and bootstrap stopped at the then-current `>=22.23.1` gate before infrastructure work. The latter gate has now been aligned with Vitest's declared range, and Cargo has a longer timeout/retry policy, but neither machine has rerun. See [support matrix](../support-matrix.md).

## What Nivyr would actually need to own

- Explicit lifecycle transitions between chain confirmation, indexer convergence, wallet scan, payment detection, and memo availability.
- State-based waits for indexer height and transaction confirmation.
- Small TypeScript observations that retain pool and amount facts instead of forcing application tests to parse CLI/RPC output.

## What Nivyr must not own

Consensus, indexing, wallet cryptography, mining implementation, test runner behavior, generic app semantics, or another local devnet. Existing upstream tools already provide these layers. The Nivyr bootstrap orchestrates pinned upstream components locally; it does not implement the node, wallet, indexer, or mining protocol.

## Final Product Decision

**REPOSITION TO LIFECYCLE LIBRARY.** The strongest experimentally validated primitive is deterministic mined-but-unscanned control followed by explicit scan and later memo availability. Real Ironwood runs prove that boundary and a tiny external HTTP app test catches premature invoice settlement. There is meaningful Zcash-specific glue across Zebra, Zaino, and the wallet CLI. A one-command pinned local bootstrap now funds itself from mature regtest coinbase rewards; no faucet is necessary. The evidence still does not justify a new test runner or general application scenario framework: keep Vitest and app-specific business assertions. Next, validate the documented bootstrap from a genuinely separate machine and replace remaining CLI-text observations with stable structured responses where available.
