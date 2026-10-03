# Friction Log

## 2026-10-01 — ZecKit protocol ceiling

- **Component:** ZecKit 1.2.0 at `e68d860`
- **Expected:** A current local stack that could be evaluated for Ironwood lifecycle testing.
- **Actual:** Its public configuration stops at NU6.1; APIs, balances, shielding, and golden flows are explicitly Orchard based. Several Docker builds also track branches instead of immutable revisions.
- **Workaround:** Evaluate Z3 plus a current wallet implementation.
- **Zcash specific:** Yes. NU6.3 changes the active shielded pool and transaction version.
- **Would an app developer repeat this:** Yes, when selecting a local stack for current protocol behavior.
- **Could a library remove it:** Partly. Nivyr can validate backend capabilities and fail clearly, while upstream remains responsible for protocol support.

## 2026-10-01 — Current wallet bootstrap choice

- **Component:** Z3/Zallet and wallet tooling
- **Expected:** A documented funded wallet round trip directly from the Z3 regtest guide.
- **Actual:** Z3 proves activation and wallet readiness, but its guide does not provide a complete two-wallet send/memo flow. Current `zcash-devtool` contains explicit regtest funding, sync, memo, JSON observation, and Ironwood support.
- **Workaround:** Validate Z3 as node/indexer substrate with pinned `zcash-devtool` wallets before creating Nivyr abstractions.
- **Zcash specific:** Yes.
- **Would an app developer repeat this:** Likely.
- **Could a library remove it:** Yes, if the path works reliably.

## 2026-10-01 — Z3's default Zaino protocol is behind its chain config

- **Component:** Z3 pinned Zaino 0.6.0 with current `zcash-devtool` regtest wallet.
- **Expected:** The wallet's explicit sync would work against the configured NU6.3 regtest indexer.
- **Actual:** Wallet initialization worked, but sync failed on `get_subtree_roots` with `Invalid shielded protocol value`. Inspection showed Zaino 0.6's protocol enum did not include Ironwood; current Zaino protocol code includes Ironwood and NU6.3 block support.
- **Workaround:** Pin Zaino 0.10.1 by immutable Docker digest through Z3's documented image override. No upstream code was changed. Sync then completed and logged Sapling, Orchard, and Ironwood subtree roots.
- **Zcash specific:** Yes. This was a shielded-pool protocol compatibility mismatch.
- **Would an app developer repeat this:** Yes, when combining independently versioned wallet and lightwalletd-compatible indexer components.
- **Could a library remove it:** Nivyr can check the gRPC capability and give a clear actionable error, but keeping the Z3 component versions compatible remains stack maintenance.

## 2026-10-01 — RPC port readiness is not semantic readiness

- **Component:** Zebra regtest.
- **Expected:** `generate` would work as soon as the JSON-RPC port answered.
- **Actual:** Early generation returned `Zebra's state is empty, wait until it syncs to the chain tip`. Polling `getblockcount` for a valid result before generating worked.
- **Workaround:** Use a state-based readiness barrier and retry only errors that indicate startup, not arbitrary sleep.
- **Zcash specific:** Partial. It is node startup behavior, while mining-control state is relevant to the lifecycle API.
- **Would an app developer repeat this:** Likely in regtest fixtures.
- **Could a library remove it:** Yes; readiness belongs in reusable infrastructure controls.

## 2026-10-01 — Coinbase maturity blocked early shielding

- **Component:** Regtest Zebra miner and `zcash-devtool wallet shield`.
- **Expected:** Coinbase-derived transparent funds could be shielded at height 106.
- **Actual:** Consensus rejected the shield transaction because the coinbase output created at height 54 was immature until height 154.
- **Workaround:** Mine enough blocks to satisfy the 100-block maturity rule, sync the wallet, then shield.
- **Zcash specific:** Yes; this is consensus and funding lifecycle behavior.
- **Would an app developer repeat this:** Yes when bootstrapping shielded test wallets from mining rewards.
- **Could a library remove it:** Yes, by mining and waiting for maturity before reporting a funded shielded wallet.

## 2026-10-01 — Wallet scan and memo availability are separate boundaries

- **Component:** `zcash-devtool` lightwallet wallet data API.
- **Expected:** A successful scan would include complete transaction details and memo plaintext.
- **Actual:** Sync detected the payment and amount, but first reported zero memos. `wallet enhance` fetched the full transaction; then text output exposed the decrypted memo. Memo decryption itself is performed by the wallet.
- **Workaround:** Model detection and full transaction enhancement as distinct operations; query after enhancement for memo.
- **Zcash specific:** Yes; encrypted memo content and shielded wallet scanning are part of the observation path.
- **Would an app developer repeat this:** Likely for memo-based reconciliation.
- **Could a library remove it:** Yes; it can coordinate enhancement and expose explicit `memoAvailable` state.
