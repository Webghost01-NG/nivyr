# External Integration Candidates

**Research date:** 2026-10-13
**Purpose:** Shortlist public Zcash payment applications for a future independent Nivyr evaluation. This is desk research only. No repository was modified and no maintainer was contacted.
**Important:** Scores below are qualitative prioritization judgments based on public documentation and repository activity. “Likelihood” means feasibility/priority for a proposed test, not evidence of a maintainer's willingness.

## Ranking

| Rank | Candidate | Payment relevance | Technical compatibility | Public activity signal | Relative testing priority | Main uncertainty |
|---:|---|---|---|---|---|---|
| 1 | [CipherPay API](https://github.com/atmospherelabs-dev/cipherpay-api) | **Very high** — merchant/product checkout, invoice state, payment stream and confirmation webhooks. | **Medium** — self-hosted Rust HTTP API and public invoice/status/SSE boundary suit black-box checks. Its documented `NETWORK` values are `testnet` and `mainnet`, and it names CipherScan as scanner API; direct Nivyr regtest compatibility is not documented. | **Recent** — GitHub API reported latest push 2026-10-12. | **Highest to test first, conditional** — clear public application API and current code activity; no evidence of interest. | Can its existing scanner be pointed at Nivyr's local regtest/indexer without changing CipherPay production code? The README does not establish this. |
| 2 | [zpay](https://github.com/gustavovalverde/zpay) | **High** — invoices/payee API, shielded ZEC settlement and payment finality for agents/apps. | **Medium-low** — public Rust workspace, multiple binaries, HTTP/API and testnet demo; no Nivyr/regtest integration is documented. This may be a useful structurally distinct test, but the exact app contract must be read and checked before an adapter is proposed. | **Recent** — GitHub API reported latest push 2026-07-21. | **Medium** — active public project with lifecycle semantics; test interest is unknown. | Agent-payment flow and wallet authorization may not match merchant-invoice settlement; local regtest support is unverified. |
| 3 | [Zink](https://github.com/KaranSinghBisht/zink) | **Very high** — invoice-specific shielded addresses, viewing-key monitoring, memo reference, and invoice state. | **Medium-low** — self-hosted code and explicit application status are useful for testing. Its README says real mined payment detection and `PAID` settlement had not yet been demonstrated; hosted demo data is synthetic. The supported wallet/network configuration and local-regtest route need validation. | **Recent but early** — GitHub API reported latest push 2026-07-15; repository describes a hackathon project and has little public issue/activity history. | **Medium-low** — the test gap maps closely to Nivyr, but willingness, maintainership and a working local test route are unknown. | The app's unverified settlement path may produce an integration result about Zink maturity rather than Nivyr's portability. Avoid implying a working merchant settlement. |
| 4 | [BTCPay Server Zcash plugin](https://github.com/btcpay-zcash/btcpayserver-zcash-plugin) | **High** — real merchant checkout/invoice processing inside BTCPay Server. | **Low-medium** — public plugin and documented BTCPay behavior offer a meaningful black-box boundary. The repository warns that one Zcash wallet is shared across stores and its local configuration uses daemon/wallet-daemon URIs; compatibility with Nivyr's modern NU6.3 stack is unproven. | **Recent repository update** — GitHub API reported latest push 2026-10-07, with an open PR at research time. | **Low-medium** — high value if compatible, but substantial backend/runtime compatibility and safety questions. | Determine whether its wallet backend supports a safe disposable regtest setup and whether one-wallet behavior is acceptable for an isolated test instance. |
| 5 | [ZGo](https://zgo.cash/) ([frontend](https://gitlab.com/pitmutt/zgo), [backend](https://gitlab.com/pitmutt/zgo-backend)) | **Very high** — POS orders and invoices use shielded memos to associate payments with orders. | **Low** — public forum material describes an AngularJS frontend and Haskell API/full-node/MongoDB backend; the documented automated viewing-key payment confirmation was a roadmap item. No current regtest-compatible setup was found. | **Stale public activity** — GitLab API reported last activity 2022-12-18 (frontend) and 2022-10-08 (backend). This is an activity signal, not proof the service is abandoned. | **Low** — strong conceptual relevance, but old activity and unknown current maintainer availability make a new integration uncertain. | Confirm current maintainership, supported node/wallet backend, and ability to run an isolated test instance before spending engineering time. |

Repository activity dates above were checked through public GitHub/GitLab repository metadata on 2026-10-13. Activity, stars, and open pull requests do not establish adoption, quality, deployment status, or willingness to participate.

## Recommended candidate and boundary

**First feasibility candidate: CipherPay API.** This is a conditional technical choice, not a partner selection or claim of interest. Its documented API exposes invoice creation/retrieval, payment status polling, a server-sent-events stream, and signed `invoice.confirmed`/expiry/cancellation webhooks. That gives Nivyr a plausible black-box settlement boundary without requiring database access. Its latest public push was very recent at research time.

### Proposed Nivyr-owned test boundary

1. Run an isolated CipherPay development instance and Nivyr's existing local regtest as separate services, with separate disposable data.
2. Use CipherPay's documented public merchant/invoice API to create a test invoice and read invoice state. Observe its public SSE/webhook or status endpoint as appropriate.
3. Drive a real Nivyr regtest payment to the invoice's expected recipient/payment reference using Nivyr's existing SDK/runtime, then assert the result only through CipherPay's public API/event surface.
4. Where CipherPay's API semantics permit, send a real mined but mismatched payment and verify that the invoice does not settle; then send the expected payment and verify the documented settlement transition.
5. Keep app data and wallet keys private. Retain only sanitized command results, app commit, package version, image digest, transaction lifecycle state, and public invoice result.

### Hard feasibility gate

CipherPay's public README documents `NETWORK=testnet|mainnet` and a `CIPHERSCAN_API_URL`; it does **not** document regtest or a local Zaino endpoint. Therefore this integration is **not currently shown to be technically ready**. Before building an adapter, an approved feasibility session must establish whether existing configuration can connect its scanner to the Nivyr-owned local stack. If a CipherPay code change or maintainer-only feature is required, obtain explicit approval and schedule it with that project; do not patch or fork it unilaterally. If the gate fails, move to the next candidate only after its own equivalent regtest feasibility check.

This boundary keeps Nivyr responsible for controlling the test chain/payment and CipherPay responsible for its own invoice state, while all assertions cross public APIs. It does not assume a universal payment adapter or require direct database inspection.

## Candidate sources and limits

- [CipherPay API repository](https://github.com/atmospherelabs-dev/cipherpay-api) — invoice, status, SSE, webhook and network configuration in the README.
- [zpay repository](https://github.com/gustavovalverde/zpay) — public payment lifecycle, invoice and demo descriptions.
- [Zink repository](https://github.com/KaranSinghBisht/zink) — per-invoice shielded destination and explicit status of unverified mined-payment settlement.
- [BTCPay Zcash plugin](https://github.com/btcpay-zcash/btcpayserver-zcash-plugin) — merchant plugin, wallet sharing warning, and daemon configuration.
- [ZGo community proposal/source pointers](https://forum.zcashcommunity.com/t/zgo-the-zcash-register/41885) — invoice/POS flow, memo relationship and GitLab repository links.
- [Nivyr public package acceptance](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/public-npm-release.json) — Nivyr's verified package and local regtest acceptance boundary.

No candidate has been run against Nivyr. No maintainer has expressed interest in this shortlist.
