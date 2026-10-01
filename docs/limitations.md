# Current Limitations

- The integration test expects an already-running local Z3 regtest stack and an already-funded sender wallet. There is no supported one-command stack bootstrap or faucet yet.
- Nivyr was tested on one Fedora x86_64 host only. The clean-checkout second-machine run is **UNVERIFIED**.
- Z3's August 2026 pin defaults to Zaino 0.6, which fails wallet Ironwood subtree requests. The experiment used Zaino 0.10.1 with a digest override. A clean install must apply that override.
- Zebra exposes wallet transaction details in a JSON shape used by the TypeScript parser. Other Zebra versions may differ.
- Memo plaintext was available only after `zcash-devtool wallet enhance`. Nivyr coordinates this; wallet code decrypts the memo.
- Wallet lifecycle code parses stable but human-oriented `zcash-devtool` text for some fields. A future machine-readable upstream command would reduce version fragility.
- Scan-height knowledge is scoped to a Nivyr instance and a wallet it explicitly syncs. Reopening an already-used wallet in a new Nivyr instance does not reconstruct historical scan progress.
- Tests use regtest-only default RPC credentials (`zebra`/`zebra`). Never point this package at a public or production wallet/node.
- The reference app is intentionally tiny and in-memory. It demonstrates external application assertions, not production merchant architecture.
- There is no public generic application adapter or multi-backend interface.
