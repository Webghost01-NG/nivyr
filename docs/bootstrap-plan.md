# Nivyr Bootstrap Plan

## Goal

Automate the currently manual, pinned Z3 regtest setup so a clean local checkout can run the real Ironwood lifecycle integration without undocumented stack setup or pre-funded wallet state. This document is an implementation plan only; no bootstrap command exists yet.

## Current Manual Flow

Observed/documented path from checkout to `npm run test:integration`:

1. Install pinned Node dependencies with `npm ci`.
2. Ensure Docker Engine is running and Docker Compose v2 is available; the pinned Z3 regtest scripts require Compose >= 2.24.4 and `openssl`.
3. Obtain Z3 at commit `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb` (currently cached under ignored `.cache/upstream/z3`; no tracked acquisition script exists).
4. Prepare Z3's generated regtest config and Zallet state with `scripts/regtest-init.sh`. This starts Zebra, waits for its RPC, mines two activation blocks, initializes Zallet, then stops the stack. It does not start Zaino or provision Nivyr's sender.
5. Start the regtest stack from the Z3 checkout using `.env.regtest`, overriding `Z3_ZAINO_IMAGE` with the pinned 0.10.1 image. Start the indexer profile so Zaino gRPC and JSON-RPC are available. The README documents a manual image override; no Nivyr wrapper exists.
6. Ensure sender wallet state and its age identity exist, and the sender has spendable **shielded** funds on this exact regtest chain. The successful run used a pre-existing funded Alice wallet; this step is currently a manual prerequisite and its exact creation/funding command was not saved.
7. Export `NIVYR_DEVTOOL`, `NIVYR_RUNTIME_ROOT`, `NIVYR_ACTIVATION_HEIGHTS`, `NIVYR_SENDER_WALLET`, and `NIVYR_SENDER_IDENTITY`; optionally set `NIVYR_EVIDENCE_DIR`.
8. From the Nivyr root run `npm run test:integration`.

Classification:

| Step / concern | Classification | Evidence / note |
|---|---|---|
| Node/npm and `npm ci` | USER PREREQUISITE / AUTOMATABLE | Host needs Node 22 and npm; repository pins package dependencies. |
| Docker daemon and Compose v2.24.4+ | USER PREREQUISITE | Must be installed/running and accessible to the invoking user. |
| `openssl`, `curl`, shell tools | USER PREREQUISITE | Z3 init uses OpenSSL and curl; shell utilities are used by its scripts. |
| Acquire Z3 commit | AUTOMATABLE, network-dependent | Clone/fetch immutable commit into ignored cache; availability depends on GitHub/network. |
| Generate Z3 regtest config / initialize Zallet | AUTOMATABLE through upstream script | Existing `scripts/regtest-init.sh` is documented as safe to rerun, but assumes no running Z3 regtest containers. |
| Pin Zaino override | AUTOMATABLE | Set `Z3_ZAINO_IMAGE` to the digest-pinned 0.10.1 image in Compose environment. |
| Start Zebra/Zaino | AUTOMATABLE | Compose commands and port mappings are documented in Z3. |
| Zebra/Zaino semantic readiness | AUTOMATABLE | Zebra RPC and Zaino `getblockcount` can be polled; a listening port alone is insufficient. |
| NU6.3 activation | AUTOMATABLE | Regtest config activates NU6.3 at height 2; check `getblockchaininfo` upgrades and height. |
| Build/acquire pinned `zcash-devtool` | AUTOMATABLE, network/build dependency | Binary was built locally with `regtest_support`; no tracked binary or bootstrap build script exists. Rust build took ~24 minutes once. |
| Create Nivyr sender wallet and identity | AUTOMATABLE candidate, details to validate | Current integration only opens existing wallet state; it creates disposable recipient wallets itself. |
| Obtain mature local mining rewards and shield them | AUTOMATABLE candidate, exact key handoff UNKNOWN | Evidence says coinbase-derived transparent funds were shielded; exact successful miner address/command is not recorded. |
| Set `NIVYR_*` paths | AUTOMATABLE | Paths can be repository-relative/cache-relative; identity and wallet data must stay ignored and permission-restricted. |
| Port availability | USER PREREQUISITE / AUTOMATABLE preflight | Existing defaults include 29232, 28237, 28137 (also Z3 services such as 8181/50232). Fail early with service/port details. |
| Second-machine portability | CURRENTLY UNKNOWN | Explicitly unverified in spike report. |

## Prerequisites

- Node.js 22.x and npm (verified host: Node 22.23.1, npm 10.9.8).
- Docker Engine and Compose v2.24.4+; verified host was Docker 29.8.1, Compose 5.5.1.
- Docker access without interactive privilege escalation, or a clear prerequisite check telling the developer how to configure it.
- `git`, `curl`, `openssl`, and a POSIX shell for Z3's current initialization scripts.
- Network access to fetch the pinned Z3 repository and pull pinned container images on first run.
- Disk and memory for Zebra/Zaino/Zallet images and regtest volumes. Clean-checkout cold startup was not measured.
- Rust/Cargo only if the bootstrap elects to build `zcash-devtool` from source. That local release build took about 24 minutes; prefer a verifiable cached build/download only if provenance and platform support can be made reproducible.

## Pinned Infrastructure

| Component | Pin / configuration |
|---|---|
| Z3 | Git commit `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb` |
| Zebra | `zfnd/zebra:6.2.3@sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2` |
| Zaino | `zingodevops/zainod:0.10.1-no-tls@sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9`; release source commit `3244a74bb09fa6a09a4b2deeb6be53bab0890747` |
| Zallet | `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d` (Z3 default) |
| `zcash-devtool` | Source commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`, locally built release with `regtest_support` |
| Regtest upgrades | `config/regtest-activation-heights.toml`; NU5 through NU6.3 at height 2 |

Z3's pinned default Zaino 0.6.0 is incompatible with the current wallet's Ironwood subtree request (`Invalid shielded protocol value`). The 0.10.1 digest override is required for the verified lifecycle. Do not silently omit or float it.

## Startup Sequence

Proposed `npm run nivyr:up` responsibilities:

1. Validate OS support, Node/npm, Docker daemon/Compose version, required shell utilities, and all expected host ports before changing state.
2. Resolve repository-relative cache/runtime paths. Refuse unsafe paths outside the project cache for generated wallet material unless explicitly configured.
3. Clone or verify the exact Z3 commit in `.cache/upstream/z3`; do not patch its tracked files. If local per-network config generation is required, use a disposable worktree/copy or documented ignored files rather than changing upstream-tracked files.
4. Generate or reuse a local Compose environment that pins all images, especially `Z3_ZAINO_IMAGE`; keep credentials/regtest wallet identity local and ignored.
5. Invoke Z3's supported regtest preparation, then start Zebra and wait for successful RPC responses and valid chain info.
6. Ensure activation blocks and verify NU6.3 is active. The init script mines two blocks on a fresh chain; on a persisted chain verify current state instead of blindly assuming it is height zero.
7. Start Zaino profile and wait for JSON-RPC height to converge with Zebra. Verify wallet gRPC is callable, not merely that TCP accepts connections.
8. Create/open a dedicated sender wallet and prepare shielded test funds using the Funding Strategy. Persist generated wallet state only in ignored local runtime storage.
9. Verify sender balance and active Ironwood rules, then print a machine-readable and human-readable `READY` summary with endpoint URLs, heights, versions, and wallet path (never seed/identity contents).

Avoid starting Zallet/rpc-router if they are not needed by the proven Nivyr flow; current Nivyr uses Zebra, standalone Zaino and `zcash-devtool`. Z3's current init script nevertheless initializes Zallet as part of its regtest setup, so removing that dependency would require a supported alternative sequence, not upstream edits.

## Readiness Checks

- **Docker:** daemon responds and Compose plugin meets the Z3 minimum.
- **Zebra:** authenticated JSON-RPC `getblockchaininfo` returns a valid regtest chain result; `getblockcount` is usable. RPC listener readiness alone was insufficient in the observed run: an early `generate` saw empty Zebra state.
- **Zaino:** JSON-RPC `getblockcount` returns a height and catches up to Zebra; gRPC `GetLightdInfo` (or a wallet sync capability check) succeeds against the pinned image.
- **Wallet:** `zcash-devtool` can open wallet, sync, and report spendable Ironwood balance. Do not infer wallet readiness from process exit or directory existence.
- Use bounded polling with last error and endpoint context; no arbitrary fixed sleeps as readiness criteria.

## Ironwood Verification

Before READY, query Zebra chain info and verify NU6.3 is active at or before the current height. The integration's transaction proof remains the definitive transaction-level check: version 6, Ironwood actions present, no Sapling/Orchard shielded components and no transparent inputs/outputs. Bootstrap readiness itself can prove activation and wallet/indexer compatibility; it must not claim that a future transaction used Ironwood before one is sent. Fail with the observed active upgrade and Zaino/wallet versions if checks disagree.

## Wallet Creation

Current integration requires `NIVYR_SENDER_WALLET` and `NIVYR_SENDER_IDENTITY` to point to a previously initialized sender; `openWallet()` only lists/opens it. `wallet()` can initialize disposable receiving wallets, but it does not fund them.

Bootstrap should provision a named local sender using `zcash-devtool` regtest wallet commands, create the identity with restrictive permissions, and preserve it under `.cache/runtime/`. The way to make that wallet's transparent mining address available to Zebra **before mining rewards** has not been recorded or validated as an end-to-end reproducible operation. This is the key implementation spike: check whether wallet initialization can create/restore deterministic disposable key material without leaking mnemonic/seed to logs or shell history, then derive the miner address and pass it as `ZEBRA_MINING__MINER_ADDRESS` through a local Compose env override. Do not reuse Z3's example miner address unless the matching private key is controlled by the provisioned wallet.

## Funding Strategy

**Observed source:** local Zebra regtest coinbase rewards created by the `generate` RPC. No public network, real funds, hosted faucet, or external funding service are involved. The recorded successful sender was already shielded/funded when the integration began; the exact funding commands, miner address and key-to-wallet handoff were not retained, so full funding reproducibility remains partially unknown.

**Required local path (candidate to validate):**

1. Create a disposable regtest wallet and obtain a transparent miner address whose private key is controlled by that wallet.
2. Configure Zebra's regtest `ZEBRA_MINING__MINER_ADDRESS` to that address before starting/mining on a fresh chain.
3. Use Zebra's `generate` RPC to mine enough blocks for the coinbase outputs to mature. Zcash coinbase maturity is 100 blocks; observed shielding at height 106 failed for an output created at height 54 and was valid at height 154. The successful setup mined until eligible rewards existed.
4. Sync the sender wallet through pinned Zaino so it recognizes mature transparent rewards.
5. Use `zcash-devtool wallet shield` to move the local mining rewards into the active Ironwood pool; wait for mining/confirmation and sync again. Verify spendable Ironwood balance before READY.

Funding can be automated entirely locally in principle: Zebra creates regtest coinbase value and controls block generation; the wallet owns the miner address and performs shielding. A **separate faucet service is not necessary**. A local funding/bootstrap helper is still necessary because the existing integration assumes shielded funds and mining rewards have maturity constraints. Nivyr should orchestrate key-safe wallet setup, local mining, maturity, sync, shield, and balance verification; it should not implement a faucet server, consensus, coin creation, or wallet cryptography.

The Z3 init script's two activation blocks may mine to its configured address before Nivyr's sender wallet is available. Those immature rewards should not be treated as sender funding. On a new isolated stack, either provision the controlled miner address before init or explicitly mine the later funding rewards to it. Persisted-chain behavior must be handled without resetting user data.

## Environment Variables

Current integration inputs:

| Variable | Required | Purpose |
|---|---:|---|
| `NIVYR_DEVTOOL` | Yes | Path to pinned `zcash-devtool` release binary with `regtest_support`. |
| `NIVYR_RUNTIME_ROOT` | Yes | Local wallet/runtime directory. |
| `NIVYR_ACTIVATION_HEIGHTS` | Yes | Regtest activation schedule; currently `config/regtest-activation-heights.toml`. |
| `NIVYR_SENDER_WALLET` | Yes | Existing funded sender wallet directory. |
| `NIVYR_SENDER_IDENTITY` | Yes | Age identity file for the sender wallet. Treat as secret. |
| `NIVYR_EVIDENCE_DIR` | No | Output directory; defaults to `docs/evidence/runs`. |

Bootstrap should derive the first four paths internally and set sender paths from its managed runtime state, so tests need no undocumented exports. Keep any Z3 Compose override and generated config under ignored local state. Current regtest RPC credentials are fixed development-only values (`zebra`/`zebra`) in the upstream Z3 regtest config; do not use them outside isolated local regtest.

## Idempotency

Required behavior before implementation:

- **First run:** acquire pins, prepare config, create stack and wallet, fund and verify, then report READY.
- **Second run:** reuse exact pins, running services, volumes, and wallet; verify health/balance without mining or shielding duplicate funds unnecessarily.
- **Already-running stack:** inspect labels/project/config/versions and attach only if it matches the expected Nivyr stack; otherwise explain conflict and leave it untouched.
- **Partially-running stack:** start missing expected services only after validating existing services and data ownership.
- **Stale containers:** identify by a dedicated Compose project name; report stale/failed services. Do not delete volumes or unrelated containers automatically.
- **Wallet exists:** verify identity can open it, network and chain match, and shielded balance suffices; never overwrite/reinitialize.
- **Wallet missing:** create securely and provision funds.
- **Funds already available:** skip funding if verified spendable Ironwood funds meet a documented threshold.
- **Interrupted startup:** resume safe idempotent preparation; distinguish uninitialized wallet DB/identity states and avoid destructive repair. Show manual recovery steps when state is ambiguous.
- **Funding interruption:** inspect wallet balance and chain height before continuing; avoid repeatedly mining/shielding without checking prior effects.

## Shutdown / Cleanup

Proposed `npm run nivyr:down` should stop only the dedicated Nivyr Compose project and its services, keeping volumes and wallet material by default. It must not use `down -v`, remove cached upstream source, erase runtime wallets, or stop a different Z3 project. Offer data deletion only as a separate explicit future command with a clear destructive confirmation; deletion is out of scope for initial `down`.

## Failure Recovery

- Print the failed phase, endpoint/command (with secret values redacted), service logs tail, current chain/indexer heights, Compose project name, and safe next step.
- Bound all readiness/funding waits and preserve state on timeout.
- On port collision, identify which required port conflicts and allow an explicit supported port configuration or fail before startup; do not kill the other process.
- If Z3 setup fails after generated config or wallet-volume preparation, rerun only documented idempotent steps. Current upstream script assumes no already-running regtest containers and performs `down --remove-orphans` in its project; bootstrap must verify ownership before invoking it.
- Never automatically run `docker compose down -v` or delete wallet data to “fix” startup.
- Pin and report image digest and source revision so protocol incompatibility is diagnosable.

## CLI Text Parsing Risk

Some wallet observations in `packages/test/src/nivyr.ts` parse human-oriented CLI text (`list-addresses`, `list-tx --mode text`, `sync` scan-height output, and `send` txid output). Bootstrap must not make fragile parsing worse: prefer stable JSON/RPC interfaces where they exist, validate expected output shape, and report version plus bounded sanitized output on parse failure. Funding readiness should use a structured balance/transaction observation if supported by this exact pinned CLI; otherwise clearly isolate and test the parser. Do not mistake successful command exit for a verified spendable Ironwood balance.

## Top 5 Implementation Risks

1. **Wallet key ↔ Zebra mining address handoff and funding.** The current repo has no recorded exact funding invocation; Z3's example `tmSR...` miner address is not proven to be controlled by the Nivyr sender. Coinbase maturity is 100 blocks, then rewards must be synced and shielded. This is a hard first task, not a presumed solved faucet.
2. **Z3 pin acquisition and local configuration without upstream edits.** Z3 is pinned to a commit but expects generated/live config files, and `regtest-init.sh` starts/stops services and assumes no running project containers. Bootstrap must use its supported workflow without mutating tracked upstream content or interfering with another stack.
3. **Zaino image override and protocol compatibility.** Z3 defaults to Zaino 0.6; the tested Ironwood wallet requires the digest-pinned 0.10.1 no-TLS image. Omitting the override makes wallet sync fail despite NU6.3 being active.
4. **Wallet persistence, retries and cleanup safety.** Reusing wallet state must not reinitialize identities, double-fund, or confuse chains; partial startup must not delete volumes or affect unrelated Z3 projects.
5. **Readiness/port and CLI observation reliability.** Zebra RPC answered before mining was semantically ready; Zaino must converge independently. Fixed default ports can collide. Some wallet state is parsed from text, so READY/funding verification must not depend on unchecked prose output.

## Proposed Commands

- `npm run nivyr:up`: validate prerequisites and port availability, acquire/use pins, prepare/start the isolated Z3 stack with pinned Zaino, wait for semantic readiness and NU6.3, provision/reuse and fund a sender, then report READY.
- `npm run nivyr:down`: stop only the managed stack while preserving data and wallet state.
- `npm run test:integration`: after `up`, run with managed `NIVYR_*` values without manual exports or wallet preparation.

## Definition of Done

From a clean checkout on a machine with the documented prerequisites, this sequence should be sufficient:

```sh
npm ci
npm run nivyr:up
npm run test:integration
npm run nivyr:down
```

There must be no undocumented manual wallet funding, manual Zaino image replacement, manually typed Z3 commands, or hidden local state required. `up` must produce local ignored state deterministically and report the pinned stack and active NU6.3 status. `down` must preserve wallet/data volumes and avoid touching unrelated services. Repeat on a clean second machine before claiming portability; second-machine validation is currently **UNVERIFIED**.
