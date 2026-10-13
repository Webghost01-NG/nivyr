# Zcash Community Grants Readiness Audit — Nivyr

**Audit date:** 2026-10-13
**Repository state reviewed:** `main` at `887c3e9` (same as `origin/main`); working tree was clean before this report.
**Released product:** `@webghost01/nivyr@0.1.0`, tag `v0.1.0` at `53a283f`.
**Scope:** Readiness and evidence audit only. No application code, package release, tag, or Git history was changed.

## Verdict

**CONDITIONAL — validate demand and an external application integration before submitting a grant request.**

Nivyr is a real, installable product with a technically credible, reproducible Fedora Linux 44 x86_64 demonstration. Its specific value is testing the boundary between a mined/indexed payment and a merchant wallet/application recognizing the expected payment. The technical proof is materially stronger than a prototype: a fresh public npm install, pinned runtime, real Ironwood lifecycle, reference forged-txid regression, and 20/20 warm-image runs are recorded.

The case for grant funding is not yet evidenced. No independent developer interviews, third-party installations, production application integration, partner commitment, or demand data are recorded. Only one host has a reproducible complete acceptance artifact. The application adapter and scenarios have passed against two local reference fixtures, not two independent applications. Before asking ZCG to fund a reusable integration layer, Nivyr should show that independent teams encounter this problem and can use the released package against their own application.

This verdict assesses the repository and public materials, not the applicant's personal capacity, identity, budget, or eligibility. Those are not established by this codebase.

## What Nivyr does today

Nivyr is a published TypeScript SDK and CLI for integration-testing Zcash payment applications. A consuming project can install the npm package, use `nivyr doctor`, `up`, `test`, and `down`, or call the SDK from its own Node test runner. The CLI manages a project-scoped, disposable Zcash regtest runtime. The SDK coordinates a pinned Zebra/Zaino stack and a digest-pinned `zcash-devtool` image. Normal package mode has evidence that it does not invoke local Rust or Cargo.

The principal verified lifecycle is:

```text
broadcast → mined → indexed → merchant wallet unscanned
→ explicit wallet sync → payment detected → enhancement → memo available
```

The observations are intentionally distinct. Zebra reporting a mined transaction establishes chain state. Zaino reaching the transaction height establishes indexer progress. Neither establishes that a particular wallet scanned the transaction. A wallet transaction record establishes detection, while enhancement makes the memo available in the tested flow. Application settlement is a separate decision that must check the expected payment semantics. A transaction ID plus mined status alone does not prove that the merchant received the expected payment.

Nivyr does not implement consensus, cryptography, a wallet, a full node, an indexer, a general-purpose test runner, or a devnet of its own. It coordinates existing components and makes specific lifecycle observations usable in TypeScript application tests.

## Evidence reviewed and claim levels

### Reproducibly evidenced in the repository

- **Public package:** `docs/evidence/public-npm-release.json` records a fresh consumer project installation from the public registry of `@webghost01/nivyr@0.1.0`, the 25-file package, integrity, doctor/import/TypeScript declarations/up/test/down results, and package hygiene. During this audit, `npm view @webghost01/nivyr@0.1.0` independently returned version `0.1.0` and the same integrity; the published version is public and `latest` was previously recorded as `0.1.0`.
- **Runtime provenance:** `docs/evidence/devtool-image.json` records the package wallet image at `ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9`, `linux/amd64`, built from zcash-devtool commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`, with provenance verification and execution evidence. The released package is pinned to the immutable digest; the mutable GHCR tag has had a separately observed digest and must not be substituted in claims.
- **Lifecycle:** `docs/evidence/packaged-lifecycle-20261003.json` records real transaction broadcast, mined height, indexed height, unscanned recipient state, sync, detection, enhancement, and memo availability from the packaged runtime. `docs/evidence/public-npm-release.json` also records those transitions from the registry-installed package.
- **Forged-txid regression:** `docs/evidence/packaged-forged-txid.json` and `docs/evidence/forge-txid.json` record a real mined regtest transaction sent to an unrelated recipient with an incorrect memo. The included mined-only reference merchant incorrectly marks `ORDER-42` paid; the corrected reference flow stays unpaid until its wallet observes the expected payment. This is evidence about Nivyr's fixtures, not a vulnerability report about any outside merchant.
- **Adapter-pattern reuse:** `docs/evidence/adapter-reuse.json` records the same scenario machinery passing against local memo-based and per-invoice-destination reference API patterns. These are two fixtures, not independent apps or production integrations.
- **Reliability:** `docs/evidence/reliability.json` records 20/20 passing packaged lifecycle/security runs, 0 failures, on Fedora Linux 44 x86_64 with a warm image. Durations: minimum 122.421 seconds, median 131.516 seconds, p95 143.010 seconds, maximum 152.526 seconds. This is one host and one recorded run series, not a cross-host reliability estimate or a cold-start benchmark.
- **Package security review:** the package acceptance records state that the 25-file allowlist excluded wallet/runtime state, private identities, environment/credential files, caches, and `node_modules`. This is a release-content review, not a formal security audit.
- **Release integrity:** Git shows `main` at `887c3e9`, clean and tracking `origin/main`; tag `v0.1.0` remains at the release merge commit. GitHub reports release `v0.1.0` published and all recorded PRs through #7 merged. This audit did not alter the release.

The source tests in the checkout contain 8 unit tests across parser, evidence sanitization, and process handling, plus a real lifecycle integration test intended for a running environment. The repository has no general CI workflow that runs package typecheck/unit/build, docs build, and full consumer acceptance on each change; the existing GitHub workflow publishes/verifies the devtool image. The stronger release acceptance results are retained as evidence artifacts, not as ongoing CI coverage.

### Owner-reported but not independently reproducible from retained records

The owner reports successful Ubuntu and macOS tests. `docs/evidence/hosts/ubuntu/owner-report-20261009.json` and `docs/evidence/hosts/macos/owner-report-20261009.json` honestly record those reports, but leave OS release, CPU architecture, Node/npm, Docker/Compose, package source/version, commands, individual results, cache state, and logs unspecified. They are not reproducible compatibility evidence. Earlier Ubuntu Cargo/network and macOS Node-gate failures remain historical attempts and are correctly separated in `docs/support-matrix.md`.

Current reproducible end-to-end host claim: **Fedora Linux 44 x86_64 only**. Ubuntu/macOS can be described only as owner-reported success pending sanitized reports. ARM64, Apple Silicon native execution, Windows, WSL, and CI-hosted execution remain unverified. The wallet image is Linux amd64; do not imply native ARM support or silently assume emulation.

### Untested or weakly evidenced

- Independent developer demand, third-party installs, customers, users, revenue, or adoption commitments: none recorded in `docs/developer-validation.md` and related validation material.
- Integration against a real third-party merchant/payment application or an independently maintained app repository: none.
- A true clean-cache/cold-image start: not measured; recorded reliability used a warm image.
- View-only merchant wallet, chain reorganization rollback, Zallet as a live backend, and multi-host reliability: not tested (`docs/evidence/limitations-timeboxes.md`, `docs/zallet-evaluation.md`).
- Formal security review, threat-model sign-off, fuzzing, dependency vulnerability review, and an external review of Docker/runtime isolation: not found in the retained evidence.

## Unique value and its limits

The useful Zcash-specific question is not just whether a transaction was constructed correctly. A merchant may observe a transaction identifier in chain data before its wallet has scanned the relevant output. Indexer convergence, wallet scanning, transaction enhancement/memo availability, and the merchant's invoice state are separate observations with separate delay and correctness risks. Nivyr exposes these states in a real shielded regtest flow and can assert application behavior through an HTTP/API boundary without inspecting application databases.

The strongest demonstrated risk is narrow and concrete: in an included fixture, a merchant that trusts a customer-supplied mined txid settles the wrong invoice. The corrected fixture waits until its own wallet observes the expected payment properties. This is a teaching and regression-testing example, not evidence of a discovered vulnerability in a named deployed service, and merchant policies differ: some reconcile a unique invoice destination, some use memos, and some use another payment event service.

The limits matter for a grant thesis. The currently shipped `PaymentAppAdapter` contract is small (`createInvoice` and `getInvoice`); it is not a universal payment protocol, generated app integration, or an out-of-the-box scenario engine for arbitrary external apps. `nivyr test` verifies Nivyr's packaged lifecycle and reference regressions; the consumer still writes application-specific assertions in Vitest or another runner. The two fixture patterns show reuse of the same test machinery but do not yet show that two independent teams share the same useful abstraction.

## Ecosystem comparison (source review as of 2026-10-13)

These projects occupy adjacent layers. The comparison is based on public primary-source documentation/repositories, not on a fresh installation and benchmark of each tool. Their public capabilities can change; recheck their current interfaces before writing a proposal.

| Project | Publicly documented scope | Relationship to Nivyr | What Nivyr should not claim |
|---|---|---|---|
| [Zebra](https://github.com/ZcashFoundation/zebra) | Rust Zcash full node. Its [regtest documentation](https://github.com/ZcashFoundation/zebra/blob/main/book/src/user/regtest.md) describes an isolated test network, configurable upgrade activation, and mining/RPC paths. | Nivyr uses a pinned Zebra runtime as chain substrate and reads chain state. | That Nivyr replaces the node, validates consensus independently, or provides protocol-level consensus tests. |
| [Zaino](https://github.com/zingolabs/zaino) | Rust Zcash indexer and light/full-client service; its public README describes access to finalized and non-finalized chain/mempool state. | Nivyr uses Zaino to expose a distinct indexed observation and wallet-sync transport. | That Nivyr reimplements indexing or proves all Zaino indexing behavior. |
| [Z3](https://github.com/ZcashFoundation/z3) | Compose platform for Zebra and Zallet across mainnet, testnet, and regtest, with optional Zaino; current docs include local regtest setup and activation configuration. | Nivyr's pinned stack uses Z3-related configuration/substrate and adds a package-owned application lifecycle harness and wallet image path. | That local Zcash infrastructure or one-command regtest startup is unique to Nivyr. Z3 itself documents developer/testing use. |
| [ZecKit](https://github.com/intelliDean/ZecKit) | Public README describes a Zcash dev-tooling CLI/Action, Docker regtest, ZingoLib wallet operations, multi-wallet testing, mining and CI integration; it currently documents NU6 and NU6.1 support. | It is a close adjacent tool for local/CI Zcash transactions. A ZecKit plus ordinary test assertions may suffice for some payment cases. Nivyr's distinct evidence is the packaged NU6.3/Ironwood chain→indexer→explicit wallet sync→enhancement→application fixture flow. | That Nivyr is the only Zcash devnet/testing tool, or that ZecKit cannot support future/current upgrades beyond what its inspected README documents. ZecKit was not executed in this audit. |
| [Zcash integration-tests](https://github.com/zcash/integration-tests) | Upstream functional tests in Python for `zebrad`, `zainod`, and `zallet`, primarily through regtest and JSON-RPC; repo documents cross-repository CI integration. | It validates Zcash components and service behavior. Nivyr targets TypeScript application-level payment lifecycle/business settlement behavior. | That Zcash lacks integration tests or CI. The relevant distinction is the application-facing assertion layer. |
| [Vitest](https://vitest.dev/) | General JavaScript/TypeScript test runner and assertion environment. | A compatible runner for consumer tests using Nivyr's SDK. | That Nivyr replaces Vitest or provides a general-purpose test runner. |

### Declined ZCG proposal #217

The [Zcash Developer Testing & Automation Toolkit proposal #217](https://github.com/ZcashCommunityGrants/zcashcommunitygrants/issues/217) is publicly closed with the `Grant Declined` label. Its proposal text described a much broader Rust/TypeScript testing toolkit: shielded-pool mocks, a local runner, consensus-upgrade/fork CI tools, documentation, and examples. In the issue discussion, a ZCG participant asked the applicants to reconcile startup funding with the milestone totals; the applicants replied that they would revise it. This records a question and response in the application discussion, **not a documented ZCG explanation for the decline**. The issue also contains ambitious scope/adoption claims. This audit does not infer the committee's reason.

The overlap is real at the broad “Zcash developer testing infrastructure” level, and other Zcash tools already cover core infrastructure/test needs. Nivyr should explicitly distinguish itself as real-transaction payment-application lifecycle testing, not repeat broad claims that Zcash has no testing stack or propose another consensus test suite. Its application boundary is plausible but still needs external proof.

## Readiness gaps

### Adoption and fit — critical

There are no recorded user interviews, third-party installs, partner letters, external applications using the package, or independently authored integrations. npm publication and download counts alone would not prove active use. The current repository records creator-maintained test evidence, which is valuable engineering evidence but not market validation. No stated founder/team roles, delivery capacity, maintenance commitment, or work-rate basis suitable for a budget is established here.

### Product/integration — high

The adapter contract is minimal and two local reference fixtures are the only reuse proof. No partner application has confirmed that its public API can be represented cleanly or that lifecycle control solves an expensive recurring test problem. A likely grant deliverable should make one externally maintained app integration work first and treat a second structurally different integration as a gated follow-on.

### Reliability and CI — high

20/20 warm-image runs on one host is a meaningful baseline, not a fleet reliability claim. There is no per-commit CI for npm tests/typecheck/build/docs or a scheduled integration smoke run. Cold pulls and CI runner feasibility are unknown. Some wallet observations are parsed from human-readable `zcash-devtool` output; the parser has fixture tests, but upstream format drift and errors can still break readiness or transaction interpretation.

### Reproducibility and support — high

Only Fedora x86_64 has retained full acceptance evidence. Ubuntu/macOS owner reports need exact machine metadata and result logs. The image is Linux amd64, so Apple Silicon behavior cannot be inferred from a Mac report without knowing whether it ran under emulation. There is no measured cold-start total.

### Security and operations — medium/high

The package allowlist and disposable-regtest boundary are good controls. The local runtime uses containers and scoped Compose resources, but Docker access remains a powerful host boundary; there is no formal external security audit. Maintainer-only npm scripts are present in the public manifest although their required source checkout files are excluded from the package archive; the release record already identifies this for a future package cleanup. This does not block existing user commands but is avoidable manifest confusion. Image supply-chain provenance exists, while workflow actions are version-tag pinned rather than immutable commit-SHA pinned; build dependency/base inputs should be reviewed when the image is deliberately rebuilt.

### Positioning and docs — medium

README and the live developer docs are product-first and mostly careful. However, `docs/landscape.md` is a dated hostile falsification report (2026-10-01) whose final recommendation says “REPOSITION” and questions whether a thin Vitest companion has enough independent value. This is useful internal evidence, but should be summarized and reconciled before a grant submission so the proposal answers the objection rather than presenting a broader framework thesis. Colosseum/hackathon materials are not substitutes for a ZCG application, partner evidence, or a grant budget.

## Grant-worthy work

### Essential, if demand is confirmed

1. **Independent problem validation:** interview payment application maintainers and wallet/indexer developers; capture current test method, missed failure modes, and whether they will run a package test. Publish consented summaries or anonymized records and do not turn interest into adoption claims.
2. **One external app integration:** work with an application maintainer to build a black-box test against the app's public API/events, with the app's CI or an independently reproducible test command. Preserve project ownership and app-specific semantics; do not force a universal invoice schema.
3. **Repeatable release/CI evidence:** automated typecheck/unit/build/docs/package checks and a small pinned-image integration smoke test on a documented supported Linux runner. Preserve all failed attempts, cache state, image digest, timings, and sanitized logs. Expand host support only where the underlying linux/amd64 container path is intentionally tested.
4. **Stability and maintenance:** define compatibility pins, supported lifecycle guarantees, image-update procedure, failure taxonomy, security contact/reporting process, and post-grant maintenance owner. Improve structured wallet observations if upstream/backend support permits; otherwise make parser limits explicit and test version drift.
5. **Docs and examples based on external use:** document the actual partner integration and common app patterns. Keep sample fixtures explicitly labeled as fixtures.

### Optional, only if independent users ask for them

- A second real application integration, especially a materially different event/webhook or per-invoice-destination model.
- A Zallet backend experiment if a partner needs structured transaction responses and a tested API can replace fragile text parsing.
- View-only merchant wallets, reorg/rollback, broader network-upgrade/pool cases, other CPU architectures, or hosted environments.
- Performance and resource benchmarks across clean environments.

Do not spend grant scope on a replacement node, indexer, wallet, test runner, generic devnet, consensus upgrade framework, or broad cross-chain testing platform. Reuse upstream components and contribute fixes upstream where that is the correct boundary.

## Proposed independently verifiable milestones

These are grant-planning estimates, not a budget quote. Effort assumes one experienced engineer with partner access and excludes waiting time for external maintainers. It should be re-estimated after validation and priced using the applicant's actual rates and direct costs; the repository does not support a defensible funding amount today. Milestones are gated so a negative result can stop or narrow later work.

| Milestone | Deliverables | Acceptance criteria | Effort estimate | Main risks |
|---|---|---|---|---|
| **1. Demand and integration discovery** | Interview protocol; 6–8 documented conversations across payment applications and wallet/indexer developers; at least 3 maintainers invited to a hands-on package evaluation; public anonymized findings and a go/no-go note. | For each conversation, record existing test process, real transaction use, scan/index delay coverage, hardest failure, interest, and permission to quote. At least 2 independent developers complete a clean package quickstart or explicitly provide a blocker log. Proceed only if a repeated problem and a plausible external app partner emerge; otherwise stop/narrow. | 2–3 engineer-weeks (roughly 80–120 hours) plus scheduling. | Small ecosystem, nonresponse, courtesy interest mistaken for intent, interview bias. |
| **2. External payment-app proof** | Partner-approved black-box integration using a real application's public API/event interface; test script/adapter; reproducible setup and sanitized CI/run evidence; design note on whether the current adapter is adequate. | App maintainer reviews/accepts the integration; test exercises at least one real local shielded payment through mined/indexed/wallet-observed state and asserts the app's actual public invoice result; wrong-recipient or equivalent invalid payment does not settle; external maintainer can rerun documented commands. No DB introspection. | 4–6 engineer-weeks (160–240 hours), including integration coordination. | Partner API is not testable in regtest, maintainers unavailable, wallet model has no controllable scan boundary, adapter over-generalization. |
| **3. CI and reproducibility hardening** | Maintained CI for package/typecheck/docs and a digest-pinned integration consumer; failure diagnostics; sanitized artifacts; package/image provenance and update procedure; cross-host reports from willing evaluators. | Clean public package install and test pass on a fresh supported Linux CI runner with no Rust/Cargo; lifecycle and security regression produce retained logs; minimum 20 sequential or scheduled runs with every attempt recorded and failures classified; image digest and architecture recorded. At least one additional independent host completes doctor/up/test/down before expanding support claims. | 3–5 engineer-weeks (120–200 hours). | Hosted runner Docker restrictions, image pull rate/latency, inadequate disk, flaky indexer readiness, test time/cost. |
| **4. Adoption, docs, and maintenance handoff** | Partner-reviewed guide and examples; contributor/release/security procedures; compatibility policy and post-grant maintenance plan; results from a small user workshop or follow-up evaluations. | At least 2 independent teams can reproduce the guide; one external integration is maintained by or accepted into the partner project; all claims link to evidence; named maintainer and planned response/upgrade cadence documented. Do not use downloads/stars as sole acceptance. | 2–4 engineer-weeks (80–160 hours). | No sustained maintainer capacity, low recurring use, documentation engagement does not convert to use. |

## Evidence to gather before submission

### Independent Zcash developer evidence

- At least 6–8 structured conversations with distinct teams, including payment apps/merchant systems and wallet/indexer integrators; avoid counting multiple people from one project as multiple independent use cases.
- Concrete examples of what is tested today: mocks, public testnet, regtest, manual flows, test harnesses, and which lifecycle boundary is missing.
- Whether developers test mined-but-not-yet-indexed, indexed-but-unscanned, enhancement/memo, wrong recipient/amount/memo, replay/duplicate, expiry, and eventual invoice settlement. Do not assume each is universal.
- A clean install session by at least two non-maintainers, with sanitized command transcripts, environment facts, errors, and permission to publish a summary.
- Evidence of intent stronger than positive comments: a maintainer-rerun test, issue/PR, CI job, integration branch, or written commitment to evaluate against a named public API.

### Potential integration partners

- One payment app with an available public repository and a maintainer willing to work on regtest.
- A documented supported test interface and a real end-to-end route from a payment event to public invoice status.
- Agreement on invoice destination/memo/amount/confirmation semantics, test data boundaries, and who maintains the adapter when the app API changes.
- A merged or partner-approved integration and a repeatable CI result. An adapter implemented solely against a local Nivyr fixture is not partner evidence.
- Optional upstream review from Zebra/Zaino/Z3/wallet maintainers on version pins and lifecycle terminology; request review, do not imply endorsement.

## Apply now or validate first?

**Validate first, then submit a narrowly scoped application if the gate passes.** The package, real modern lifecycle, runtime provenance, and one-host reliability evidence establish technical execution. They do not establish that another Zcash team needs a separately maintained adapter/scenario package, that the current contract generalizes, or that funding is necessary to deliver an externally used outcome. A short validation milestone can answer these questions at much lower risk than a larger framework proposal.

If the team already has independent written commitments or external run logs not represented in this repository, attach them with consent and reassess. Do not state them in the application until they are documented. A submission now could still be defensible as a small exploratory grant, but would need an explicit validation-first, stop/go scope and a complete team/capacity/budget section; a broad product-development request is premature on the evidence here.

## Submission readiness checklist

| Area | Current status | Needed before application |
|---|---|---|
| Public artifact and technical product | **PASS** | Cite npm release, image digest, package acceptance, and bounded supported-host claim. |
| Real shielded/Ironwood lifecycle proof | **PASS, one host** | State the single verified host and warm-cache context. |
| Merchant settlement security example | **PASS, reference fixtures only** | Keep explicit that no third-party vulnerability is alleged. |
| Cross-platform validation | **PARTIAL** | Retain owner-reported Ubuntu/macOS evidence as reported; request sanitized exact host/run reports before claiming reproducible support. |
| Independent demand | **MISSING** | Conduct interviews and obtain at least two independent package evaluations. |
| External application integration | **MISSING** | Identify a partner and prove its actual public application behavior end to end. |
| Maintenance/security plan | **PARTIAL** | Name accountable maintainers, response expectations, vulnerability contact, image/package update process. No formal security audit is evidenced. |
| Budget and delivery capacity | **MISSING FROM REPOSITORY** | Provide named people, availability, rate basis, direct costs, and realistic milestone pricing. This audit intentionally assigns no dollar amount. |
| ZCG application/discussion materials | **NOT PREPARED FOR THIS PROJECT** | Write a project-specific application only after validation; publish the requested community discussion and incorporate feedback. |
| Demo assets | **NOT GRANT EVIDENCE BY THEMSELVES** | Provide a truthful, concise live or recorded technical demonstration if requested; identify reference fixtures clearly. |

## Immediate next actions (smallest evidence-building sequence)

1. Ask the owner to save sanitized Ubuntu and macOS reports with exact OS/CPU and package/CLI command outcomes, including whether Apple Silicon used amd64 emulation. Keep the existing status as owner-reported until records arrive.
2. Conduct the structured developer conversations and record results in `docs/validation.md`; report negative findings too.
3. Choose one external payment application with a willing maintainer and run a short API/regtest feasibility spike before promising an adapter milestone.
4. Ask the partner and one Zcash infrastructure maintainer to review the integration boundary/pins; label responses as review, not endorsement.
5. Draft the grant scope, staffing, risk, and rate-based budget only after the first four steps. Keep optional scenarios out unless partner evidence justifies them.

## Sources

### Repository and release artifacts

- [Nivyr source, `main`](https://github.com/Webghost01-NG/nivyr/tree/main)
- [README](https://github.com/Webghost01-NG/nivyr/blob/main/README.md)
- [Support matrix](https://github.com/Webghost01-NG/nivyr/blob/main/docs/support-matrix.md)
- [Public npm acceptance](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/public-npm-release.json)
- [Image provenance and digest](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/devtool-image.json)
- [Lifecycle evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-lifecycle-20261003.json)
- [Forged-txid evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-forged-txid.json)
- [Adapter reuse](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/adapter-reuse.json)
- [Reliability runs](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/reliability.json)
- [Public release](https://github.com/Webghost01-NG/nivyr/releases/tag/v0.1.0)
- [Published npm package](https://www.npmjs.com/package/@webghost01/nivyr)

### External primary sources reviewed 2026-10-13

- [Zebra regtest documentation](https://github.com/ZcashFoundation/zebra/blob/main/book/src/user/regtest.md)
- [Z3 project and regtest documentation](https://github.com/ZcashFoundation/z3)
- [Zaino repository](https://github.com/zingolabs/zaino)
- [ZecKit repository](https://github.com/intelliDean/ZecKit)
- [Zcash integration-tests repository](https://github.com/zcash/integration-tests)
- [Vitest documentation](https://vitest.dev/)
- [ZCG proposal #217, declined](https://github.com/ZcashCommunityGrants/zcashcommunitygrants/issues/217)
