# Nivyr Handoff

## Current state

- Local repository: `/home/web-ghost/nivyr`, branch `spike/zcash-lifecycle`.
- `153eebc` is HEAD and corrects the final timing report. Its parent, `2b3ba58`, contains the TypeScript lifecycle controls, reference HTTP merchant, and successful real regtest integration scenario.
- The final integration run passed 3/3: real transaction v6 Ironwood payments, mempool/mined observation, mined-but-unscanned boundary, explicit wallet sync, memo enhancement, and correct/wrong memo application assertions.
- `docs/spike/spike-report.md` already includes those final findings. The second-machine validation remains **UNVERIFIED**.

## Pinned runtime

- Z3: commit `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`.
- Zebra: `zfnd/zebra:6.2.3`, digest `sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2`.
- Zaino: `zingodevops/zainod:0.10.1-no-tls`, digest `sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9`; release source commit `3244a74bb09fa6a09a4b2deeb6be53bab0890747`. Z3's default Zaino 0.6 does not support the wallet's Ironwood sync request.
- `zcash-devtool`: commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`, release build with `regtest_support`.
- NU6.3 activates at regtest height 2. Host/Node/Vitest/Rust versions are in `docs/spike/environment.md`.

## Reproduce the successful integration run

Use the pinned local Z3 regtest stack with Zebra RPC at `127.0.0.1:29232`, Zaino JSON-RPC at `127.0.0.1:28237`, and Zaino gRPC at `localhost:28137`. Start its indexer with `Z3_ZAINO_IMAGE` set to the pinned Zaino image and digest above. The sender wallet must already have spendable shielded regtest funds.

From the repository root:

```sh
npm ci
export NIVYR_DEVTOOL=/path/to/zcash-devtool
export NIVYR_RUNTIME_ROOT="$PWD/.cache/runtime/integration"
export NIVYR_ACTIVATION_HEIGHTS="$PWD/config/regtest-activation-heights.toml"
export NIVYR_SENDER_WALLET=/path/to/funded/sender-wallet
export NIVYR_SENDER_IDENTITY=/path/to/sender.age
export NIVYR_EVIDENCE_DIR="$PWD/docs/evidence/runs"
npm run test:integration
```

Required `NIVYR_*` variables: `NIVYR_DEVTOOL`, `NIVYR_RUNTIME_ROOT`, `NIVYR_ACTIVATION_HEIGHTS`, `NIVYR_SENDER_WALLET`, `NIVYR_SENDER_IDENTITY`. `NIVYR_EVIDENCE_DIR` is optional; it defaults to `docs/evidence/runs`.

## Remaining blockers and next tasks

- Second-machine validation: **UNVERIFIED**.
- Next implementation task: reproducible one-command local regtest bootstrap.
- Task after that: local faucet/funding automation.
- Known issue: some wallet observations parse human-oriented `zcash-devtool` CLI text.
- Do not redo the completed shielded lifecycle work; its evidence is in `docs/evidence/` and the spike report.
