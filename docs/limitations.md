# Current Limitations

- `npm run nivyr:up` bootstraps the pinned local Z3 regtest and funds the sender without a faucet; `npm run test:integration` expects that managed runtime to have reached READY. The integration runner does not start it implicitly.
- The primary Fedora x86_64 host is verified. An Ubuntu independent retry is **BLOCKED/PENDING** after a reported Cargo crates.io timeout, and a macOS retry is **BLOCKED/PENDING** after the former Node gate. The changes described here have not been rerun on either machine. See [support matrix](support-matrix.md).
- Z3's August 2026 pin defaults to Zaino 0.6, which fails wallet Ironwood subtree requests. The experiment used Zaino 0.10.1 with a digest override. A clean install must apply that override.
- Zebra exposes wallet transaction details in a JSON shape used by the TypeScript parser. Other Zebra versions may differ.
- Memo plaintext was available only after `zcash-devtool wallet enhance`. Nivyr coordinates this; wallet code decrypts the memo.
- Wallet lifecycle code parses human-oriented `zcash-devtool` text for address, send txid, sync progress, payment amount/pool, and decrypted memo. Parser errors now avoid echoing command output, but correctness still depends on pinned CLI text fields. `list-tx --json` only supplies txid and mined height, not amount/pool/memo. A future machine-readable upstream response would reduce this fragility.
- A failed first bootstrap after crates.io download has not yet been retried on Ubuntu. The new timeout/retry policy and preservation behavior are locally reviewed but require independent confirmation.
- Node 22.14.0 was not run through the full project on the macOS tester's machine. The previous 22.23.1 minimum had no code/dependency basis found; final Node support matches Vitest's declared engine range.
- Scan-height knowledge is scoped to a Nivyr instance and a wallet it explicitly syncs. Reopening an already-used wallet in a new Nivyr instance does not reconstruct historical scan progress.
- Tests use regtest-only default RPC credentials (`zebra`/`zebra`). Never point this package at a public or production wallet/node.
- The reference app is intentionally tiny and in-memory. It demonstrates external application assertions, not production merchant architecture.
- There is no public generic application adapter or multi-backend interface.

## Runtime configuration and failure diagnostics

`npm run test:integration` reads the managed bootstrap state by default. It reports distinct cases for no runtime/state, incomplete or malformed state, a bootstrap that has not recorded READY, and configured services that do not answer Zebra/Zaino JSON-RPC. It does not start the stack implicitly. Fully specified `NIVYR_*` values still permit an explicitly managed external/local test setup.

The ordinary two-command sequence should be run fail-fast (`npm run nivyr:up && npm run test:integration`). There is no separate `nivyr:verify` command: the exact observed sequencing mistake is prevented by a direct actionable preflight in the integration runner without adding another lifecycle command or auto-cleaning useful failure state.

## CLI parsing audit

| Location / signal | Purpose | Criticality | Structured alternative in pinned interfaces | Action / residual risk |
|---|---|---|---|---|
| `scripts/nivyr.ts`: `list-addresses --receiver transparent` output | Recover miner receiver owned by the wallet | Bootstrap-critical | Pinned `list-addresses` has no JSON mode; the command emits the `Receiver(transparent):` label | Require exactly one labeled line; fail closed. CLI format change blocks bootstrap. |
| `scripts/nivyr.ts`: `wallet shield` output | Recover shield txid after submit | Bootstrap-critical | Pinned shield command prints status text and then txid; no JSON output option found | Extract only a 64-hex txid; do not log output when absent. Pending `list-tx --json` recovery is validated before resubmitting. |
| `scripts/nivyr.ts`: `list-tx --json` | Recover an interrupted, unmined shield | Bootstrap-critical | Structured JSON exists with txid and mined height only | Validate array, txid and height shape. Malformed/error output now stops before creating another shield. Zebra RPC errors other than transaction-not-found are not swallowed. |
| `scripts/nivyr.ts`: `balance --json` | Verify mature transparent and spendable Ironwood balances | Bootstrap-critical | Structured JSON exists | Parse and validate required numeric fields; fail closed on schema change. |
| `packages/test/src/nivyr.ts`: `list-tx --json` | Determine wallet has the exact transaction | Lifecycle-correctness-critical | Structured JSON exists with txid/mined height | Parse JSON; malformed JSON throws. It does not contain amount/pool/memo fields. |
| `packages/test/src/nivyr.ts`: `list-tx --mode text` | Return amount, pool and decrypted memo after enhancement | Lifecycle-correctness-critical | No equivalent structured fields in pinned `list-tx --json`; JSON implementation emits only txid/mined height | Typed parser validates required amount/pool and returns absent data as unavailable; parser errors no longer echo full wallet output. Human text schema remains a pin-specific dependency. |
| `packages/test/src/nivyr.ts`: `sync`/`enhance` progress text | Preserve wallet scan-height observation | Observation-only | No structured scan-height API found in pinned CLI | Parse known `Historic(start..end)` progress; absent progress leaves scan height unknown unless sync's conservative pre-sync indexer lower bound applies. |
| `packages/test/src/parse.ts`: `send` output | Return payment txid from public API | Lifecycle-correctness-critical | Pinned send command prints txid but has no structured mode | Validate 64-hex line and fail clearly without including output. |

The wallet CLI is pinned to commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`. `list-addresses` text, send/shield txid output, scan progress, and human transaction detail remain brittle to upstream output changes. Nivyr does not parse transaction bytes or decrypt memos itself. A follow-up should request stable JSON fields upstream rather than read the wallet SQLite database directly.
