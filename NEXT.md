# Nivyr Handoff

## Current state

- Repository `/home/web-ghost/nivyr`, branch `spike/zcash-lifecycle`.
- Existing lifecycle controls and reference merchant remain intact.
- `npm run nivyr:up`, `npm run test:integration`, and `npm run nivyr:down` now orchestrate a pinned local Z3 regtest. Fresh funding uses a wallet-owned transparent P2PKH coinbase receiver, 100-block maturity, then a real Ironwood shield.
- Clean-room Gate 1 and an isolated automated bootstrap reached positive Ironwood spendable balance. Fresh integration passed; preserved-state restart reused the wallet. Second-machine validation remains **UNVERIFIED**.

## Pinned runtime

- Z3 `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`
- Zebra `6.2.3`, digest in `docs/bootstrap-plan.md`
- Zaino `0.10.1-no-tls`, digest in `docs/bootstrap-plan.md`
- zcash-devtool `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`
- NU6.3 activates at regtest height 2.

## Reproduce

```sh
npm ci
npm run nivyr:up
npm run test:integration
npm run nivyr:down
```

`down` preserves Nivyr volumes and wallet identity. See [README](README.md), [bootstrap plan](docs/bootstrap-plan.md), and [spike report](docs/spike/spike-report.md). Never remove unrelated containers/volumes.

## Remaining work

1. Perform clean-checkout validation on a separate machine; status must remain UNVERIFIED until done.
2. Inspect/replace the remaining human-oriented `zcash-devtool` text parsing where a supported structured surface exists.
3. Consider port configurability only if a real host conflict requires it.

Do not redo the real lifecycle or competitor research. No faucet is needed for local regtest funding.
