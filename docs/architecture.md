# Architecture

Nivyr is an in-process TypeScript helper used from ordinary Vitest tests. In this spike it talks to three existing surfaces:

| Surface | Nivyr uses it for |
|---|---|
| Zebra JSON-RPC | `generate`, `getblockcount`, and transaction state/pool inspection via `getrawtransaction` |
| Zaino JSON-RPC and gRPC | independent indexed height; wallet lightwallet protocol connection |
| `zcash-devtool` CLI | disposable wallet initialization, transaction construction, wallet scan, received amount and memo enhancement |

## Lifecycle observations

The four knowledge domains remain separate: **chain knowledge != indexer knowledge != wallet knowledge != application knowledge**. A mined transaction does not imply indexing, recipient scanning, memo availability, or application settlement.

| State | Observer and exact signal | Control / evidence type | Barrier and timeout | Ambiguity / what it does not imply |
|---|---|---|---|---|
| `broadcast` | Zebra `getrawtransaction(txid, 1)` returns transaction data; `in_active_chain=false`, no height, 0 confirmations | Created by `pay`; observed from Zebra | No polling in `transaction()`; direct RPC has an 8s request timeout | Wallet send returning a txid alone does not prove Zebra accepted it. A mempool observation does not mean confirmed or indexed. |
| `mined` | Zebra transaction response has `in_active_chain=true`, numeric height, block hash and confirmations | Controlled by `mine()`; observed from Zebra | `waitForTransaction(txid, predicate)` polls every configured 100ms, default overall 20s | Does not imply Zaino indexed it, wallet scanned it, or app settled it. |
| `indexed` | Zaino JSON-RPC `getblockcount() >= minedHeight` | Observed independently from Zaino | `waitForIndexer(height)` polls every configured 100ms, default overall 20s | Indexer tip reaching the height does not prove every transaction lookup/query path is ready or the recipient scanned it. |
| `recipient-unscanned` | After chain and indexer barriers, `observeWallet()` finds no txid in `list-tx --json` for a newly created recipient; test has not invoked `sync()` | Test controls by creating a fresh wallet and withholding explicit `sync`; absence is observed from wallet DB | No timed wait; caller must first establish chain/indexer barriers | Absence is bounded to that wallet's current DB and observation time. It does not prove the transaction is unknown to chain/indexer. |
| `wallet-synchronized` | `wallet sync` exits successfully; Nivyr records parsed scan completion height when emitted | Explicitly requested; wallet reports success | CLI process timeout 300s; no independent scan-height convergence loop | If CLI emits no range, Nivyr stores the indexer height sampled before sync as a conservative lower bound. That fallback is inferred, not an independently queried wallet scan height. |
| `payment-detected` | `wallet list-tx --json` contains exact txid and `mined_height` | Observed from wallet structured JSON | Direct observation after sync; no wait helper currently wraps this query | Presence proves wallet DB has a transaction record, not correct business interpretation or memo availability. |
| `enhanced` | `wallet enhance` exits successfully | Explicitly requested; wallet performs transaction retrieval/decryption | CLI process timeout 300s | Successful exit alone does not guarantee a particular memo was recovered; inspect the observation. |
| `memo-available` | `wallet list-tx --mode text` has the transaction section and `Memo::Text(...)`; parser returns plaintext | Wallet performs decryption; Nivyr parses resulting text | Direct observation after enhancement; no separate Nivyr wait barrier | Missing/malformed text is returned as `memo: null`; it does not imply no encrypted memo was sent. |

RPC polling is condition-based, not a fixed delay: the condition is transaction status or indexer height. The 100ms interval is only the sampling cadence. Timeouts produce the last RPC error where available. Wallet subprocesses have a 300s process limit; RPC calls have an 8s request limit. The example merchant readiness probe retries HTTP status until a 5s deadline.

Wallet scan height is reported as unknown before the Nivyr-controlled `sync()` call. After successful sync, Nivyr records the highest completed scan height from wallet progress output. If the wallet reports no scan range, Nivyr uses the indexer height sampled immediately before sync as a conservative lower bound; it does not assume that blocks indexed while sync was running have also been scanned. This is an observation from the test-controlled wallet operation, not an app database query.

## Evidence-backed ownership

Nivyr currently removes repeated glue for transaction JSON normalization, exact ZEC/zatoshi conversion, process invocation, mining, independent indexer convergence polling, explicit wallet scan, and the follow-up wallet enhancement required before a memo is visible. The application remains a black box: the reference test uses its HTTP API.

Nivyr does not run or configure the node stack yet, and it does not provide generic app adapters, arbitrary confirmation policies, a package release, or CI orchestration. Those are not proven necessary by this spike.
