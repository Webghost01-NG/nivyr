# Nivyr Bootstrap Plan

## Goal

Provide a reproducible local regtest lifecycle so a clean checkout can start pinned Z3, create a disposable sender wallet, generate its own mature funding, shield into Ironwood, run integration tests, and stop without touching other Docker projects.

Implemented in `scripts/nivyr.ts` and `scripts/run-integration.ts`. The bootstrap is intentionally a single pinned Z3 backend, not a general infrastructure adapter.

## Current Manual Flow

The former manual steps are now orchestrated by `npm run nivyr:up`: acquire/verify pinned sources, generate an isolated ignored Z3 runtime, run Z3's prepare-only regtest initialization, start Zebra and Zaino, wait for semantic readiness and NU6.3, create/reuse wallet and age identity, configure Zebra's miner address, mine and mature local rewards, shield to Ironwood, and verify balance. `npm run test:integration` reads the generated private runtime state; `npm run nivyr:down` stops only the Nivyr Compose project and preserves data.

Manual prerequisites remain: install Node/npm, Git, Docker Engine/Compose, curl and OpenSSL; keep Docker running; allow network on first source/image acquisition. Cargo is required only if the pinned wallet binary is absent from the source cache. No manual wallet setup, funding, Zaino replacement, or Z3 command is part of normal operation.

## Prerequisites

- Node.js 22.23.1 or newer and npm.
- Docker Engine and Compose v2.24.4 or newer, with access to the running daemon.
- `git`, `curl`, `openssl`; `tar` for source extraction.
- Network access on first run to fetch pinned Git sources and digest-pinned images.
- Cargo/Rust if the locally cached pinned `zcash-devtool` release binary is absent. The existing local build took about 24 minutes; the first-run time on another machine is unmeasured.
- Available default ports: 49232 (Zebra RPC), 49080 (Zebra health), 49137/49237 (Zaino gRPC/JSON-RPC), 49532 (Zallet), 49818 (router). Bootstrap checks conflicts before stack startup and does not kill other processes.

## Pinned Infrastructure

| Component | Pin |
|---|---|
| Z3 | `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb` |
| Zebra | `zfnd/zebra:6.2.3@sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2` |
| Zaino | `zingodevops/zainod:0.10.1-no-tls@sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9` |
| Zallet | `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d` |
| zcash-devtool | source `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`, built with `regtest_support` |
| Regtest activations | NU6.3 active at height 2; `config/regtest-activation-heights.toml` |

Z3's default Zaino 0.6 is incompatible with current wallet Ironwood subtree requests. The pinned 0.10.1-no-tls image is required. Exact host and image evidence is also in `docs/spike/environment.md`.

## Startup Sequence

`npm run nivyr:up` currently performs these steps:

1. Validate Node, Git, curl, OpenSSL, Docker, Compose and daemon availability.
2. Verify/fetch exact Z3 and zcash-devtool commits under ignored `.cache/upstream`; use an existing matching wallet release binary or build that commit with `regtest_support`.
3. Extract pinned Z3 source to `.cache/runtime/nivyr-bootstrap/z3` and create private runtime configuration with digest-pinned images and a Nivyr-owned Compose project.
4. Run the upstream `regtest-init.sh --prepare-only` flow, then start Zebra and wait for valid JSON-RPC chain state.
5. Mine activation blocks only when needed; verify NU6.3 reports active. Start Zaino and wait for its JSON-RPC height to catch Zebra.
6. Create/reuse the sender wallet and age identity under the ignored runtime directory. Derive the wallet's transparent P2PKH receiver.
7. Recreate only Zebra with the wallet-owned coinbase receiver, mine 100 local coinbase rewards, then restore the default non-sender miner.
8. Observe Zebra's actual height after miner reconfiguration. If it reopened behind the recorded controlled mining tip, lower the controlled reward end and recalculate its maturity target from that observed height. This handles a restart/reopen height discrepancy without assuming requested blocks persisted.
9. Mine until 100-block coinbase maturity, wait for Zaino convergence, sync the wallet, and require positive mature transparent spendable balance.
10. Shield those mature funds. Verify the shield transaction from Zebra as version 6 with Ironwood actions and no Orchard/Sapling output, mine if needed, wait for indexer convergence, sync, and require at least 0.1 ZEC of `ironwood_spendable`.
11. Save local state and print a READY summary. The integration runner loads endpoint and sender-wallet settings from this managed state.

## Readiness Checks

- Zebra readiness is based on successful `getblockchaininfo` and matching `getblockcount`, not an open port.
- NU6.3 must report `active` at height >= 2.
- Zaino JSON-RPC `getblockcount` must reach the Zebra target height before wallet sync.
- Sender wallet `balance --json --min-confirmations 1` must include numeric `transparent_spendable`, `ironwood_spendable`, and `chain_tip_height` values. Scan height must reach the chain height.
- Shielding is not ready until Zebra confirms a version-6 transaction with positive Ironwood action count and no Orchard or Sapling output, Zaino catches up, and wallet JSON balance reports positive spendable Ironwood funds.
- Polling is bounded; readiness barriers use RPC state. No arbitrary startup sleep is used.

## Ironwood Verification

The runtime verifies NU6.3 activation, retrieves the shielding transaction from Zebra, and rejects it unless `version === 6`, `ironwood.actions.length > 0`, no Orchard actions, and no Sapling shielded outputs. After confirmation and wallet sync, readiness requires `ironwood_spendable >= 10_000_000` zatoshi. The bootstrap therefore fails closed instead of treating an Orchard fallback as success.

## Wallet Creation

The sender's key material and age identity live only under `.cache/runtime/nivyr-bootstrap/wallets/` with restrictive permissions. `wallet init` creates the wallet; `wallet list-addresses --receiver transparent` supplies its P2PKH receiver. On later starts the identity/address are reused. A half-present wallet/identity pair is preserved and reported as an error rather than overwritten.

## Funding Strategy

No faucet or external ZEC is needed. Zebra regtest mining creates coinbase rewards payable to the sender wallet's own transparent P2PKH receiver. After maturity, the wallet's supported `shield` operation spends those local rewards into the active NU6.3 pool. The shielded spendable balance, not just command success, is the final readiness gate.

### Verified Fresh Funding Flow

**VERIFIED — manual clean-room Gate 1 and automated isolated Gate 3.** Both used a new Compose project/chain volumes and newly generated sender wallet; no pre-funded wallet, mnemonic, rewards, or external service was reused. Gate 1 evidence is in `docs/evidence/bootstrap/`; the automated run's READY output/state is in `.cache/runtime/nivyr-bootstrap/state.json` (ignored) and lifecycle evidence under `docs/evidence/bootstrap/integration/`.

Manual Gate 1 observed:

- Fresh chain began at height 0, NU6.3 activation blocks brought it to height 2.
- A new zcash-devtool wallet derived a P2PKH transparent receiver; Zebra's first controlled coinbase output paid that same receiver.
- 100 controlled reward blocks took height 2 to 102, with first controlled reward at height 3.
- Attempting to shield at height 102 was rejected by Zebra: a coinbase output from height 86 was immature for candidate height 103 and needed height 186. This records the exact maturity boundary; balance totals before maturity are not proof of spendability.
- A further 100 blocks took the chain from height 102 to 202. Wallet sync reported positive mature transparent balance. Shield transaction `0022346ce508e42dd6e0672f67e92c2a5cddcd4c3c65172d88b8707aded6847d` was version 6, had 4 Ironwood actions, 100 transparent inputs, no transparent outputs, no Orchard/Sapling components, and confirmed at height 203.
- After indexer convergence and wallet sync, `ironwood_spendable` was `62,499,480,000` zatoshi. Evidence includes `first-shield-rejected.json`, `maturity-mining.json`, `shield-confirmed.json`, and `final-balance.json`.

The automated clean-room run also began with height 0, a unique Compose project, no runtime directory, and a new sender. It printed READY at height 203 with `ironwood_spendable=62,499,480,000` zatoshi. The shield txid was `56a733a1825bd2c9a0e258e27686ae140e6ebeabc3b314a53a50eb9024eb597d`; Zebra reported v6, 4 Ironwood actions, 100 transparent inputs, no transparent outputs, no Orchard actions or Sapling shielded outputs. From first infrastructure volume creation to READY was 196 seconds with wallet binary, source and images already cached; this is not a clean-host dependency-download/build measurement. The fresh-run integration took 88.10 seconds; a preserved-state start took 5.35 seconds and its integration took 78.03 seconds. See `automated-cleanroom-proof.json` and `automated-cleanroom-timings.md`. A follow-up change also makes maturity target derive from Zebra's observed height after miner-address reconfiguration, so any reopen-height discrepancy is handled explicitly rather than relying on requested block count.

Commands/APIs in the automated path: `wallet init`; `wallet list-addresses --receiver transparent`; Compose recreation of only Zebra with `ZEBRA_MINING__MINER_ADDRESS`; Zebra JSON-RPC `generate`; Zaino gRPC wallet `sync`; wallet `balance --json`; wallet `shield`; Zebra `getrawtransaction`; and a final sync/balance check. All are local regtest operations.

## Environment Variables

Normal quickstart requires no `NIVYR_*` variables. `npm run test:integration` reads generated values from bootstrap state: devtool path, runtime root, activation file, sender wallet/identity, Zebra RPC and Zaino endpoints. Optional `NIVYR_BOOTSTRAP_ROOT` selects an alternate private runtime path for isolated operation; `NIVYR_COMPOSE_PROJECT` selects the corresponding distinct Compose project name. `NIVYR_EVIDENCE_DIR` can override the per-run evidence output path. These override variables are not required for ordinary use.

Local regtest RPC credentials are fixed development-only `zebra`/`zebra` values in the generated Z3 config; they must never be reused outside the isolated local test network.

## Idempotency

Implemented and exercised across the second run:

- First run creates a new chain, sender, local rewards and Ironwood balance.
- Second `up` reuses the same wallet/address, running services, chain volumes and positive shielded balance; it does not mine/fund again when ready.
- A partial sender wallet/identity pair fails closed and is not overwritten.
- Existing service containers are identified by a dedicated Compose project label. `down` addresses only this project.
- Maturity is based on actual reopened chain height if Zebra restarts behind the last requested controlled block.
- Pending shield tx can be recovered from wallet transaction list plus Zebra mempool inspection before attempting another shield.
- State ambiguity causes an actionable error; no automatic `down -v`, volume deletion, wallet recreation, or unrelated container cleanup occurs.

## Shutdown / Cleanup

`npm run nivyr:down` stops only the `nivyr-zcash-regtest` Compose project and preserves volumes and sender wallet state. Run `npm run nivyr:up` again for a fast restart. No destructive reset command is provided. To fully discard state, first stop Nivyr and then manually remove only volumes/container state bearing the Nivyr project label after checking Docker's displayed names; never use broad `docker system prune` or remove other Z3 projects.

## Failure Recovery

The command reports the failed step and preserves runtime/wallet state. Inspect `docker compose` logs from `.cache/runtime/nivyr-bootstrap/z3`, current Zebra/Zaino heights, and `.cache/runtime/nivyr-bootstrap/state.json` (never share the age identity or wallet files). Retry `npm run nivyr:up` after correcting the stated issue. Port collision checks fail before startup rather than killing the owner. Runtime config and ownership markers prevent an unexpected directory/project from being overwritten.

## CLI Text Parsing Risk

The bootstrap uses structured wallet balance JSON and Zebra/Zaino JSON-RPC for balances, heights and transaction pool proof. It still parses human-oriented output for the transparent address (`list-addresses`), shield command txid, and wallet transaction list recovery (`list-tx --json`, which has a JSON envelope but current field shape is CLI-owned). Lifecycle code also parses some human-oriented zcash-devtool output for wallet observations. Output shape is validated and failures are explicit. Replacing these with stable structured wallet APIs is a separate task.

## Top 5 Implementation Risks

1. **Pinned wallet source cold build:** if no cached binary is present, Cargo build can add roughly 24 minutes on this machine; another machine's build duration is unverified.
2. **Coinbase maturity and Zebra restart height:** 100 blocks are required; query actual post-recreation height and verify wallet spendable balance rather than trusting requested block count. Premature shield was actually rejected in Gate 1.
3. **Zaino protocol pin:** default Z3 Zaino 0.6 fails current wallet Ironwood sync; the digest-pinned 0.10.1-no-tls image must remain configured.
4. **Private wallet persistence / partial startup:** preserve identity and chain state, avoid duplicate funding, and fail closed if wallet/runtime markers disagree.
5. **Host conflicts and CLI output surfaces:** ports may already be owned; some wallet commands do not expose fully stable structured responses. Preflight ports, inspect project labels, validate text parsing and keep second-machine validation open.

## Proposed Commands

Implemented commands are:

- `npm run nivyr:up` — pin, prepare, start, fund, shield, validate and print READY.
- `npm run test:integration` — run real lifecycle integration using managed local config.
- `npm run nivyr:down` — stop only Nivyr services while preserving state.

## Definition of Done

The first-run developer sequence passed on this host; fresh bootstrap evidence is recorded above. The sequence is:

```sh
npm ci
npm run nivyr:up
npm run test:integration
npm run nivyr:down
```

It required no manual wallet funding, manual Zaino replacement, manually typed Z3 commands, or hidden prior wallet state. The separate second-machine repetition remains **UNVERIFIED**.
