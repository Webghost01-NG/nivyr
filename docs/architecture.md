# Architecture

Nivyr is an in-process TypeScript helper used from ordinary Vitest tests. In this spike it talks to three existing surfaces:

| Surface | Nivyr uses it for |
|---|---|
| Zebra JSON-RPC | `generate`, `getblockcount`, and transaction state/pool inspection via `getrawtransaction` |
| Zaino JSON-RPC and gRPC | independent indexed height; wallet lightwallet protocol connection |
| `zcash-devtool` CLI | disposable wallet initialization, transaction construction, wallet scan, received amount and memo enhancement |

## Lifecycle observations

| State | Observation |
|---|---|
| Broadcast / unmined | Zebra can return the tx from `getrawtransaction`; active-chain flag false, no height, zero confirmations |
| Mined | Zebra returns active-chain true, mined height, block hash, and confirmation count |
| Indexed | Zaino `getblockcount` reaches the mined height; it is polled separately from Zebra |
| Mined but recipient unscanned | fresh recipient has no matching wallet transaction after chain and indexer converge; explicit scan has not been run |
| Detected | `zcash-devtool wallet list-tx --json` includes txid after explicit sync |
| Memo available | wallet `enhance` fetched full transaction data; `list-tx` then emits decrypted `Memo::Text(...)` |

Wallet scan height is reported as unknown before the Nivyr-controlled `sync()` call. After successful sync, Nivyr records the highest completed scan height from wallet progress output. If the wallet reports no scan range, Nivyr uses the indexer height sampled immediately before sync as a conservative lower bound; it does not assume that blocks indexed while sync was running have also been scanned. This is an observation from the test-controlled wallet operation, not an app database query.

## Evidence-backed ownership

Nivyr currently removes repeated glue for transaction JSON normalization, exact ZEC/zatoshi conversion, process invocation, mining, independent indexer convergence polling, explicit wallet scan, and the follow-up wallet enhancement required before a memo is visible. The application remains a black box: the reference test uses its HTTP API.

Nivyr does not run or configure the node stack yet, and it does not provide generic app adapters, arbitrary confirmation policies, a package release, or CI orchestration. Those are not proven necessary by this spike.
