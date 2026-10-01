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

