# ZCG Application Claims and Evidence Matrix — Nivyr

**Review date:** 2026-10-13
**Purpose:** prevent the draft from overstating shipped functionality, user demand, integration scope, or grant readiness. Links point to repository artifacts on `main` unless noted.

## Claims used in the draft

| Claim | Evidence | Evidence level | Safe wording / limit |
|---|---|---|---|
| Nivyr is a TypeScript SDK and CLI for Zcash payment application lifecycle testing. | [README](../../README.md), [package metadata](../../package.json), [public npm release record](../evidence/public-npm-release.json), [npm package](https://www.npmjs.com/package/@webghost01/nivyr) | Released product; maintainer-run package acceptance recorded | Safe to describe product and published commands. This does not prove independent use. |
| Public package is `@webghost01/nivyr@0.1.0`. | [npm package](https://www.npmjs.com/package/@webghost01/nivyr), [release record](../evidence/public-npm-release.json), [GitHub release](https://github.com/Webghost01-NG/nivyr/releases/tag/v0.1.0) | Public artifact and retained registry evidence | Link the immutable release and package; do not imply this grant draft changes the release. |
| The pinned devtool image is a digest-pinned Linux/amd64 image. | [image evidence](../evidence/devtool-image.json) | Maintainer evidence with digest/provenance details | Use digest `sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9`; do not claim ARM/native Apple Silicon. |
| Normal package runtime does not require local Rust/Cargo compilation. | [public npm acceptance](../evidence/public-npm-release.json), [image evidence](../evidence/devtool-image.json) | Verified in the recorded Fedora package flow | Phrase as the normal image-mode flow tested on the recorded host; do not imply every possible host is validated. |
| Real lifecycle records broadcast, mined, indexed, recipient unscanned, sync, detected, enhanced, and memo available. | [public npm acceptance](../evidence/public-npm-release.json), [packaged lifecycle](../evidence/packaged-lifecycle-20261003.json) | Real packaged regtest transaction, maintainer run | This verifies the recorded environment and scenario, not every Zcash payment/app policy. |
| A mined transaction ID alone may not establish that an invoice's expected payment arrived. | [forged-txid evidence](../evidence/forge-txid.json), [packaged forged-txid evidence](../evidence/packaged-forged-txid.json) | Controlled local reference-application regression | State exact fixture behavior. Do not call it an exploit or vulnerability in an outside merchant. |
| Corrected reference flow waits for expected wallet-observed payment semantics. | [forged-txid evidence](../evidence/forge-txid.json) | Controlled local fixture | This supports the tested reference behavior only; application settlement rules vary. |
| Same scenario machinery passes against memo-based and per-invoice-destination patterns. | [adapter reuse evidence](../evidence/adapter-reuse.json) | Two local reference API fixtures | Call them reference patterns, not two production apps, third-party apps, or independent integrations. |
| 20 packaged runs passed. | [reliability evidence](../evidence/reliability.json) | 20/20 on Fedora Linux 44 x86_64, warm image | Include host/cache context. It is not a multi-host reliability rate or cold-start benchmark. |
| Fedora Linux 44 x86_64 completes public npm install, doctor, up, test, down, and import. | [public npm acceptance](../evidence/public-npm-release.json), [final release regression](../evidence/final-release-regression.json) | Maintainer-run external consumer project using public registry, retained result | “External project” means outside the source checkout, not an independent tester. |
| Ubuntu/macOS have successful runs. | [Ubuntu owner report](../evidence/hosts/ubuntu/owner-report-20261009.json), [macOS owner report](../evidence/hosts/macos/owner-report-20261009.json) | Owner-reported only; release, CPU, software versions, commands, and logs are missing | Say owner-reported, not independently reproducible or verified platform support. Earlier failed attempts are historical and separately recorded. |
| CipherPay might be a candidate. | [candidate research](integration-candidates.md), especially its [repository README](https://github.com/atmospherelabs-dev/cipherpay-api) | Desk research only | CipherPay is not a partner. Its docs do not establish local regtest support. Integration is a go/no-go risk, not a promised compatibility. |
| The project's proposed category is Infrastructure. | ZCG's [official category list](https://zcashcommunitygrants.org/categories); scope in this proposal | Applicant choice / application framing | Confirm the category at filing; no implication of ZCG pre-approval. |
| The application is requesting $12,000. | Conditional arithmetic in this draft and [budget worksheet](budget-draft.md) | Working request only; applicant rate and capacity unknown | The model narrows work to 240 hours and balances only at $50/hour with zero direct costs. These are not verified applicant financial facts. Do not submit until confirmed. |

## Claims intentionally excluded

| Potential claim | Why unsupported or misleading | Evidence needed before it could be stated |
|---|---|---|
| “Zcash developers use/adopt Nivyr” or “users want this.” | No independent interviews, installs, adoption, customer or usage evidence is present. | Consented, attributable independent interviews and hands-on evaluation records; distinguish interest from adoption. |
| “Nivyr integrates with CipherPay” or CipherPay is a partner. | Candidate review is desk research; no maintainer agreement or regtest compatibility evidence exists. | Approved feasibility run and partner permission; then retain app revision, commands, logs, and public-interface result. |
| “Two external applications are integrated.” | Two local fixtures demonstrate patterns only. | Independent external application repository/app-owner rerun, consent, and reproducible artifacts. |
| “Nivyr found a merchant exploit.” | The failure is deliberately implemented in a local reference fixture. | A separately authorized and independently validated finding in a named app would require the app's security process and permission; none is claimed here. |
| “All Linux, macOS, or ARM systems are supported.” | Full reproducible acceptance exists for Fedora 44 x86_64; Ubuntu/macOS owner reports lack logs and machine details; image is amd64. | Complete fresh-package `doctor/up/test/down` evidence with OS release, architecture, Node/npm, Docker/Compose, image mode, and sanitized logs for each claim. |
| “Nivyr is formally security audited/isolated.” | Package hygiene and Nivyr-owned shutdown evidence are not a formal security audit; Docker grants host-level authority. | Defined external review or audit with scope/results, plus documented threat model; never imply guarantees beyond scope. |
| “Cold start takes X” or “20 runs prove general reliability.” | Cold image-pull time was not measured; 20 runs came from one host with warm image. | True cold-cache measurements and retained run series across stated hosts/runners. |
| “Zallet/view-only/reorg workflows are supported.” | These areas are recorded as untested/insufficient in the limitations docs. | Completed test artifacts for each exact capability. |
| “The MIT license requirement is met.” | `package.json` declares MIT, but no tracked `LICENSE` file is present on current `main`. | Verify rights and add appropriate full license text/file before filing; applicant must confirm authority. |
| “Applicant can deliver the budget/schedule.” | No verified applicant name, relevant background, hours, rate, availability, personal runway, or maintenance commitment appears in repository evidence. | Applicant-supplied facts and rate basis; feasible calendar after award/payment schedule; named maintenance commitment. |
| “ZCG declined proposal #217 because of X.” | The linked issue is closed/declined, but repository audit says no decline rationale was established; a budget discussion is not proof of cause. | Do not infer a reason; refer only to the public status if relevant. |

## Source-of-truth evidence links

- [Readiness audit](zcg-readiness-audit.md)
- [Integration candidate research](integration-candidates.md)
- [Independent validation plan](external-validation-plan.md)
- [Milestone plan](milestone-plan.md)
- [Budget worksheet](budget-draft.md)
- [Public npm acceptance JSON](../evidence/public-npm-release.json)
- [Image provenance JSON](../evidence/devtool-image.json)
- [Lifecycle JSON](../evidence/packaged-lifecycle-20261003.json)
- [Forged transaction regression JSON](../evidence/forge-txid.json)
- [Adapter reuse JSON](../evidence/adapter-reuse.json)
- [Reliability JSON](../evidence/reliability.json)
- [Ubuntu owner report](../evidence/hosts/ubuntu/owner-report-20261009.json)
- [macOS owner report](../evidence/hosts/macos/owner-report-20261009.json)
- [Repository release](https://github.com/Webghost01-NG/nivyr/releases/tag/v0.1.0)
- [Published npm package](https://www.npmjs.com/package/@webghost01/nivyr)
