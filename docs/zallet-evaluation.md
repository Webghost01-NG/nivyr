# Zallet Evaluation

Evaluation date: 2026-10-03. Target image in the verified source stack is `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d`. This is a capability review of release documentation and local image metadata, not a successful live RPC trial. No wallet was initialized or transacted for this evaluation.

| Capability | Status | Evidence / limit |
|---|---|---|
| Wallet creation/import | AVAILABLE | The image has `init-wallet-encryption` and `generate-mnemonic`; release RPC supports imported keys/addresses. No end-to-end creation/import was tested. |
| Sending | AVAILABLE | The beta.1 release notes document `z_sendmany` support for transparent inputs and shielded sends. It has not been exercised in Nivyr's stack. |
| Sync progress | INSUFFICIENT | The image exposes `getwalletstatus`, but this evaluation did not establish a stable, structured scan-height/progress field sufficient to replace the current lifecycle barrier. |
| Transaction history | AVAILABLE | Zallet's RPC surface includes structured wallet transaction inspection (`z_viewtransaction` / `gettransaction` family). Exact pinned-image response shape was not exercised. |
| Received payment amount | INSUFFICIENT | Structured balances/transaction data appear available, but this evaluation did not verify an exact Ironwood received amount and invoice attribution on the pinned beta. |
| Memo | INSUFFICIENT | Structured transaction inspection exists; this evaluation did not verify memo plaintext availability before/after enhancement or the precise Ironwood response fields on beta.1. |
| View-only wallet | MISSING | The beta.1 release did not include `z_importviewingkey`; upstream release notes say that method was added in beta.2. Do not infer beta.2 behavior for the pinned beta.1 image. |

Decision: **KEEP DEVTOOL** for the current sprint. Zallet has promising structured surfaces, but no tested Nivyr-compatible path currently reduces more risk than the pinned `zcash-devtool` CLI. Re-evaluate against a deliberately upgraded Z3/Zallet set after preserving the packaged lifecycle proof.

References: [Zallet beta.1 release notes](https://github.com/zcash/zallet/releases/tag/v0.1.0-beta.1), [Zallet RPC method reference](https://zcash.github.io/zallet/rpc/index.html), [Zallet RPC shell client](https://github.com/zcash/zallet/blob/main/book/src/cli/rpc.md). The live reference is newer than beta.1; use it for method concepts, not as proof of the pinned image's exact behavior.
