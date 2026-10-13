# Nivyr — Zcash Community Grants Application Draft

**Status: APPLICANT REVIEW REQUIRED — NOT READY TO SUBMIT.** This draft was prepared against the official ZCG issue template retrieved from [`grant_application.yaml` at commit `bce86883b7bb9b0e1a6d4ef8b5939786484847c5`](https://github.com/ZcashCommunityGrants/zcashcommunitygrants/blob/bce86883b7bb9b0e1a6d4ef8b5939786484847c5/.github/ISSUE_TEMPLATE/grant_application.yaml) on 2026-10-13. It is not a grant application, legal acceptance, partner commitment, or representation that unresolved facts have been verified.

The official template requires all Terms and Conditions checkboxes and several personal/financial facts. The applicant must review and complete those fields personally. **Do not submit this text as-is.** The repository has no tracked `LICENSE` file even though `package.json` declares `MIT`; that conflict must be resolved before representing that Nivyr is licensed under the MIT terms required by the grant agreement.

## Application title

`Grant Application - Nivyr: Zcash Payment Lifecycle Testing`

## Official form fields

The field IDs and labels below follow the official template. Text marked **REQUIRED FROM APPLICANT** is intentionally left unresolved.

### Terms and Conditions

**Form field:** `terms_and_conditions_checkboxes` — **REQUIRED FROM APPLICANT; leave unchecked until the applicant personally reviews and accepts each item.** No legal agreement is accepted by this draft.

- [ ] I agree to the [Grant Agreement](https://9ba4718c-5c73-47c3-a024-4fc4e5278803.usrfiles.com/ugd/9ba471_f81ef4e4b5f040038350270590eb2e42.pdf) terms if funded.
- [ ] I agree to provide KYC information if funded above $50,000 USD.
- [ ] I agree to disclose conflicts of interest.
- [ ] I agree to adhere to the ZCG [Code of Conduct](https://forum.zcashcommunity.com/t/zcg-code-of-conduct/41787) and [Communication Guidelines](https://forum.zcashcommunity.com/t/zcg-communication-guidelines/44284).
- [ ] I understand milestone deliverables will be validated and accepted by intended users or their representatives against user stories.
- [ ] I agree that new open-source software will include a `CONTRIBUTING.md` reflecting Zcash development standards and the `librustzcash` style guides.
- [ ] I understand contributions to existing Zcash code must follow the relevant project's contribution, merge, branch, review, and commit policies.
- [ ] I agree to post request details on the [Zcash Community Grants forum](https://forum.zcashcommunity.com/c/grants/33).
- [ ] I understand I must post the submitted issue link to the forum for community input.

### Application Owners

**Form field:** `assignees` — **REQUIRED FROM APPLICANT:** GitHub username of the individual responsible. Verify whether `@Webghost01-NG` is the applicant; repository ownership alone does not establish the applicant's identity.

### Organization Details

**Form field:** `organization_details_name` — **REQUIRED FROM APPLICANT:** legal name or the individual name to use as the applicant. The repository identifies the project, not the applicant's legal identity.

**Form field:** `organization_details_discovery` — **REQUIRED FROM APPLICANT:** how the applicant learned about ZCG. Do not infer this from repository activity.

### Project Overview

**Form field:** `project_overview_amount` — **Working request: $12,000 USD, conditional on applicant-confirmed rates, capacity, dates, and direct-cost assumptions in the budget section below.** The requested total is not yet defensible as a final submission amount.

**Form field:** `project_overview_category` — **Infrastructure.** The proposed work improves developer-facing infrastructure for testing Zcash payment applications; it does not propose a new consensus, wallet, node, or indexer implementation.

### Team Information

**Form field:** `team_information_project_lead`

```text
Name: REQUIRED FROM APPLICANT
Role: Solo developer / project lead (confirm exact role and commitment)
Background: REQUIRED FROM APPLICANT — provide verifiable relevant experience
Responsibilities: Lead validation, one gated external-application integration, package/CI reproducibility, documentation, and maintenance handoff (confirm availability and scope)
```

**Form field:** `team_information_members`

```text
None or N/A. The applicant reports that this is a solo-developer application; no additional team members are identified.
```

### Project Details

**Form field:** `project_details_summary`

Nivyr is an installable TypeScript SDK and CLI for integration-testing Zcash payment applications across real regtest chain, indexer, wallet, and application observations. This validation-first grant would test whether independent developers need the layer and, only if a willing application's public interface is compatible, deliver one bounded external integration with reproducible evidence.

**Form field:** `project_details_description`

Zcash payment state is distributed across several systems: a transaction can be broadcast and mined before an indexer has caught up; an indexer can know about it before a recipient wallet scans it; a wallet can detect it before enhancement exposes its memo; and an application must still decide whether the observed payment satisfies a particular invoice. Treating these states as equivalent can produce flaky tests or incorrect settlement logic.

Nivyr `v0.1.0` already provides a public npm package, CLI (`doctor`, `up`, `test`, `down`), TypeScript API, and a digest-pinned local regtest stack. Retained maintainer-run evidence on Fedora Linux 44 x86_64 records an Ironwood-era payment lifecycle, an included forged-txid reference regression, two local reference API patterns, and 20/20 packaged runs with a warm image. These results establish a technical baseline, not external adoption.

The proposed grant is deliberately gated. It begins with independent developer validation and package evaluations. The next gate examines whether one external payment application can be tested through its public API against Nivyr's disposable regtest. CipherPay is a desk-researched candidate, not a partner; its published configuration does not establish regtest support. If no independent need or feasible, approved application boundary is found, later integration work stops or returns for scope approval. If the gates pass, the project will implement one narrow, application-specific test and improve repeatability and handoff. No third-party repository changes are assumed.

Independent user adoption, customer demand, external application integrations, and partner commitments have not been demonstrated in the retained evidence. The grant is intended to test those uncertainties rather than present them as established facts.

**Form field:** `project_details_problem`

Payment application tests often need to distinguish chain confirmation from indexer convergence, wallet scanning, transaction enhancement, and invoice settlement. Existing node, indexer, and general test-runner tools provide important lower-level capabilities, but an application team still needs a reproducible way to drive a real local payment and assert its own public settlement behavior at these boundaries. Nivyr's current evidence demonstrates a concrete reference failure: a fixture that accepts any mined customer-supplied txid can mark an unrelated invoice paid. There is not yet independent evidence that this is a frequent pain across teams; Milestone 1 measures that before the proposal funds broader integration work.

**Form field:** `project_details_solution`

Use a real disposable Zcash regtest environment and a TypeScript-facing test harness to expose separate chain, indexer, and wallet observations. First validate the problem with independent developers and fresh package runs. Then test feasibility with an application maintainer and, only if its public API can use the local test environment without an unapproved third-party code change, implement a single bounded black-box scenario. The scenario will assert the application's documented invoice state for an expected payment and a relevant invalid payment. A go/no-go decision prevents spending later milestone funds on an incompatible application or unsupported general abstraction.

**Form field:** `project_details_format`

- Interview protocol, anonymized findings, and a public go/no-go report.
- Sanitized reports from at least two non-maintainer fresh npm-package evaluations, including failures.
- A feasibility report for one external application candidate; CipherPay is conditional and not a partner.
- If gates pass, one Nivyr-owned adapter/example or partner-approved test integration against that application's public API/event surface, with expected and invalid-payment cases.
- Package/CI reproducibility improvements, a pinned-runtime runbook, sanitized test artifacts, and a maintenance/compatibility handoff.
- No new wallet, node, indexer, generic devnet, consensus suite, or general-purpose test runner.

**Form field:** `project_details_dependencies`

- One developer's confirmed availability and actual compensation basis; identity, capacity, and rate remain REQUIRED FROM APPLICANT.
- Independent Zcash developers willing to participate in validation; none are currently recorded as committed.
- A candidate application whose maintainer approves evaluation and whose public interfaces can be exercised against local regtest. CipherPay's README documents `testnet`/`mainnet`, not Nivyr regtest; feasibility is unresolved.
- Existing Nivyr package/runtime pins, Docker/Compose and a supported Linux/amd64 host for the project-owned baseline.
- For CI, a provider/runner that permits the required container workflow and a verified cost basis; no service cost is included in the provisional budget.
- ZCG review/award timing, which must be used to confirm milestone calendar dates and payment terms.

No third-party maintainer, company, or integration partner has agreed to participate. Outreach and any code changes in another repository require the applicant's approval and that project's consent.

**Form field:** `project_details_technical`

Nivyr will remain an application-level harness over existing infrastructure. The current released path uses a digest-pinned `ghcr.io/webghost01-ng/nivyr-zcash-devtool` Linux/amd64 image and pinned Zcash stack; package-mode operation does not require compiling Rust or Cargo. Tests drive disposable NU6.3/Ironwood regtest payments and observe broadcast, mined, indexed, wallet-unscanned, sync, detected, enhanced, and memo-available states separately.

The funded external test will use the selected application's public HTTP/API/event interface and will not inspect its database. Its assertions will follow that application's own invoice policy (for example, expected destination, amount, memo, or documented event) rather than impose a universal settlement schema. The Nivyr-owned test will retain package/image revisions, commands, sanitized logs, every failed attempt, and consented partner validation. CI work is conditional on a small runner feasibility pilot. No platform or performance claim will be broadened without retained complete-flow evidence.

**Form field:** `project_details_merge`

The proposed work does not plan to fork or modify Zebra, Zaino, Z3, or another upstream Zcash repository. Nivyr coordinates these existing components above their infrastructure layer. If feasibility work identifies a specific upstream defect or a generally useful compatibility improvement, the applicant will first open an issue or request maintainer guidance; any patch would be separately scoped, reviewed, and submitted under that project's contribution rules. No upstream merge, review, or endorsement is assumed, and no upstream change is included as a required milestone deliverable.

**Form field:** `project_details_license` — **MIT is declared in `package.json`, but no tracked `LICENSE` file was found on `main`. REQUIRED before submission:** applicant must confirm rights and resolve the missing license text/file. The ZCG template says the grant agreement requires MIT. Select `MIT` only after the repository has an appropriate MIT license file and the applicant confirms authority; until then, this field is unresolved and the application is not ready to file.

### Budget

**Budget model status: CONDITIONAL; not an applicant-confirmed rate or cost estimate.** The earlier planning document estimated 440–720 hours for the broader four-milestone plan. At a $12,000 cap, that entire scope is not supportable without an unusually low, verified rate and leaves no room for direct costs. This draft narrows the work to 240 hours, one candidate application, one integration only if feasibility passes, and a limited CI/handoff scope.

The arithmetic below is a transparent break-even model, not a claim that the applicant's rate is $50/hour: `$12,000 ÷ 240 hours = $50/hour`. The applicant must provide their actual rate, accept the committed hours, confirm direct costs, and revise the request or scope if those inputs differ. At any positive direct cost `D`, the maximum compensation rate for 240 hours becomes `($12,000 − D) ÷ 240`. No unquoted or invented expense is included.

**Form field:** `budget_hardware` — `$0 provisional; REQUIRED FROM APPLICANT: confirm no project hardware/software purchase is needed. If a purchase is needed, attach current price evidence and reduce compensation or revise the request.`

**Form field:** `budget_hardware_justification` — The provisional scope assumes use of the applicant's existing development computer and existing software. This assumption is not verified as an applicant commitment. No new hardware/software amount is requested until the applicant confirms need and provides current cost evidence.

**Form field:** `budget_service` — `$0 provisional; REQUIRED FROM APPLICANT: confirm no paid CI, storage, registry, or other external service is necessary. Otherwise provide a current price basis and reconcile it within the cap.`

**Form field:** `budget_service_justification` — The proposal does not presently have a provider quote or verified service bill. CI is limited to a feasibility pilot; use of a paid service is not assumed. Do not submit a zero service-cost assertion until the applicant verifies the intended runner, retention, and registry costs.

**Form field:** `budget_compensation` — `$12,000 only under the conditional model of 240 committed solo-developer hours at an applicant-confirmed $50/hour and $0 direct costs. REQUIRED FROM APPLICANT: enter the actual agreed compensation and adjust hours/scope if the rate is different.`

**Form field:** `budget_compensation_justification`

| Milestone | Planning hours | Provisional allocation at the $50/hour break-even rate |
|---|---:|---:|
| M1 — independent validation and go/no-go | 50 | $2,500 |
| M2 — external application feasibility | 50 | $2,500 |
| M3 — one gated external integration and checks | 100 | $5,000 |
| M4 — reproducibility, docs, and maintenance handoff | 40 | $2,000 |
| **Total** | **240** | **$12,000** |

These are planning allocations, not verified applicant hours or an accepted rate. They intentionally narrow the earlier 440–720 hour outline. M3 is capped at one public-API integration without third-party repository changes; if the application requires broader upstream work, the funded scope must stop or be re-approved instead of silently exceeding this budget. Applicant must state rate source, availability, tax/fee basis, and any in-kind/unpaid time.

**Form field:** `budget_total` — `$12,000 conditional total = $0 hardware/software + $0 services + $12,000 compensation. This reconciles only if the applicant verifies the zero direct costs and 240 hours at $50/hour. Otherwise replace the component values and recalculate; the total must equal the requested amount.`

**Form field:** `budget_previous_funding` — **REQUIRED FROM APPLICANT:** select Yes or No based on actual ZCG funding history. Do not infer from repository evidence.

**Form field:** `budget_previous_details` — If Yes, provide grant identifier, amount, period, deliverables, and outcomes. If No, enter `N/A`. **REQUIRED FROM APPLICANT.**

**Form field:** `budget_other_sources` — **REQUIRED FROM APPLICANT:** select Yes or No based on received or planned funding for this work.

**Form field:** `budget_other_sources_details` — If Yes, name the source, amount, status, and which costs it covers; disclose overlap. If No, enter `N/A`. **REQUIRED FROM APPLICANT.**

### Risk Assessment

**Form field:** `risk_implementation`

- **No repeated external need:** interviews may find the problem is infrequent or already handled. M1 records negative results and gates all implementation; stop if no repeated pain is found.
- **No willing external tester/maintainer:** package evaluations or app feasibility may not attract participants. Do not label owner activity independent; report the blocker and stop/re-scope.
- **CipherPay compatibility:** its documented network options do not establish local regtest support. Treat CipherPay as a conditional candidate; do not promise it as the integration. M2 may conclude no-go.
- **Integration exceeds 100 hours:** application-specific scanner configuration or policy may require upstream changes. Keep the public API boundary; no unilateral patch; stop or seek scope approval.
- **CI cannot run Docker reliably:** test one runner before building a matrix; preserve failures and narrow claims if restrictions/resource cost make it infeasible.
- **Wallet output/pin drift:** preserve pinned digests, parser fixtures, and revision metadata; describe compatibility limits rather than claiming universal support.
- **Solo capacity and schedule:** workload competes with other commitments. Applicant must confirm availability and maintenance ownership before filing; milestone dates are provisional until grant timing is known.
- **Budget assumptions fail:** if actual rate exceeds $50/hour or direct costs are nonzero, reduce hours/scope or revise the request; do not hide costs or overcommit.

**Form field:** `risk_side_effects`

The integration could be mistaken for endorsement by a candidate application, or a fixture result could be misread as a vulnerability finding. All examples will be labeled as reference or partner-approved tests, permission will be recorded, and no third-party security claim will be made. New test automation may consume Docker disk/CPU and create local disposable wallet state; instructions will scope cleanup to Nivyr-owned resources and warn users not to share `.nivyr` state or secrets. A narrow adapter could overfit one app, so app-specific semantics remain explicit and no universal payment contract is promised. The proposal will not modify upstream components absent maintainer approval.

**Form field:** `risk_metrics`

- **M1 validation:** 6–8 documented interviews across distinct projects; at least two non-maintainer fresh-package evaluations or reproducible blocker reports; publish an anonymized go/no-go memo including negative evidence.
- **M2 feasibility:** one candidate receives an approved, documented feasibility evaluation; report exact app revision/configuration, public interface, regtest connection result, and go/no-go. A failed feasibility is a valid result, not an integration success.
- **M3 integration (only after gates):** one public-API scenario asserts a real local payment against the app's actual invoice state; includes expected and relevant invalid payment; partner reruns documented commands or supplies an explicitly scoped blocker report. No DB inspection.
- **M4 reproducibility:** all attempts retained and classified; package/typecheck/unit/build/docs checks automated where feasible; 20 attempts only if environment permits, with every result and image/cache status preserved; one independent rerun; support and maintenance limits documented.
- **Adoption evidence:** count only independently attributable, consented evaluations and app-owner reruns. Downloads, stars, owner tests, and courtesy interest are not adoption metrics.

### Project Schedule

**Provisional calendar assumption:** the dates below assume an award and project start around 2027-01-01. ZCG review/award date and applicant availability are unknown. **REQUIRED FROM APPLICANT:** confirm or replace dates before submission; these are proposed targets, not commitments already made.

**Form field:** `schedule_startup` — `$0 requested, conditional on applicant confirming they can begin after award without advance funds.`

**Form field:** `schedule_startup_justification` — No separate startup advance is included. The proposed plan begins after award and uses milestone-based work; the applicant would begin M1 only when grant terms and first payment timing permit. This assumes the applicant can cover any pre-payment time. If that is not true, identify the actual start-up need, basis, and payment timing and reconcile it with the $12,000 total before filing.

**Form field:** `schedule_milestones`

```yaml
- Milestone: 1
  Amount (USD): 2500
  Expected Completion Date: 2027-02-15
  User Stories:
    - "As a Zcash payment developer, I want to describe my existing payment test process and pain points, so that Nivyr's scope is based on a repeated problem rather than the maintainer's assumptions."
    - "As an independent package evaluator, I want a clean-install test protocol, so that I can report success or a reproducible blocker without cloning Nivyr."
  Deliverables:
    - Interview protocol and anonymized findings for 6–8 developers from distinct projects, including negative responses and permission status.
    - At least two non-maintainer fresh-registry evaluation records or detailed sanitized blocker reports for doctor/up/test/down.
    - Go/no-go memo that states whether repeated need and a feasible external application candidate exist.
  Acceptance Criteria:
    - Reviewable records distinguish independent participants from the project owner; no adoption is inferred from interest.
    - Each interview records current testing process, real-transaction use, sync-delay/wrong-payment coverage, hardest failure, and quote permission.
    - Two independent evaluations complete the full command flow or preserve a stage-specific reproducible blocker.
    - If repeated need is absent, later implementation is not started without a revised scope approved by ZCG.

- Milestone: 2
  Amount (USD): 2500
  Expected Completion Date: 2027-03-31
  User Stories:
    - "As a merchant-application maintainer, I want a bounded test to determine whether my public payment interface can be evaluated against local Zcash regtest, so that integration cost and compatibility are known before implementation is promised."
    - "As a grant reviewer, I want a documented go/no-go decision, so that an incompatible candidate does not consume the integration budget."
  Deliverables:
    - Approved feasibility evaluation of one candidate. CipherPay is the first desk-researched candidate, not a partner; an alternate requires its own approval and evidence.
    - Sanitized app revision, configuration, public API/event boundary, and regtest connectivity report.
    - No-go report and recommendation if the candidate cannot be tested without unapproved app changes.
  Acceptance Criteria:
    - Candidate maintainer has approved the feasibility activity before any contact or app-repository change; no endorsement is implied.
    - Assertions are limited to the application's public interface; no application database access.
    - Report records observed facts and a clear go/no-go. A well-supported no-go fulfills this feasibility milestone but does not authorize M3 integration spending.

- Milestone: 3
  Amount (USD): 5000
  Expected Completion Date: 2027-06-15
  User Stories:
    - "As a Zcash payment-app developer, I want a real local payment test against my application's public invoice state, so that I can verify the app's own settlement policy end to end."
    - "As an app maintainer, I want an invalid-payment regression alongside the expected payment, so that mined status alone cannot satisfy an invoice in the tested flow."
  Deliverables:
    - If and only if M1/M2 pass, one Nivyr-owned adapter/example or partner-approved integration for one external application's public API/event surface.
    - One real regtest expected-payment case and one relevant invalid-payment case, using that app's own documented semantics.
    - Partner-reviewed reproduction steps and sanitized evidence; disclose any required app-side change and obtain separate approval before making it.
  Acceptance Criteria:
    - App owner or authorized representative reruns the documented command and confirms the tested behavior meets the stated user story.
    - Test uses no DB inspection and records Nivyr/app revisions, image digest, commands, and all attempts.
    - If M2 is no-go, M3 is paused; no alternative app or deliverable is substituted without applicant and ZCG approval. No payment for unperformed integration work is implied.

- Milestone: 4
  Amount (USD): 2000
  Expected Completion Date: 2027-07-15
  User Stories:
    - "As a developer evaluating Nivyr, I want reproducible installation, troubleshooting, and evidence instructions, so that I can verify the package without maintainer assistance."
    - "As a future maintainer, I want explicit compatibility and update procedures, so that pinned infrastructure can be maintained without unsupported claims."
  Deliverables:
    - Package CI/reproducibility checks feasible on the selected runner, with retained successful and failed attempt records.
    - Partner-reviewed or independently rerun integration guide; compatibility, Docker/runtime, security-reporting, image-update, and release runbooks, including a `CONTRIBUTING.md` aligned with the accepted grant terms.
    - Final evidence index and post-grant maintenance owner/capacity statement.
  Acceptance Criteria:
    - Fresh package install and library import plus repository typecheck/unit/build/docs checks pass in the documented environment, or each blocker is retained and classified.
    - Every platform claim is linked to complete-flow evidence; only independent results are labeled independent.
    - At least one non-maintainer rerun is recorded if participants and the integration gate permit; otherwise document the blocker without claiming external validation.
    - Named maintenance owner, available capacity, and support limits are confirmed by the applicant.
```

The four allocations sum to `$2,500 + $2,500 + $5,000 + $2,000 = $12,000`. The provisional effort sums to `50 + 50 + 100 + 40 = 240 hours`; at a break-even model of `$50/hour`, compensation sums to `$12,000`. Startup funding is `$0` and the provisional hardware/software and service totals are each `$0`, so the budget reconciles only if the applicant confirms those assumptions. Update all fields together if any input changes.

### Supporting Documents

**Form field:** `supporting_documents`

- [Nivyr v0.1.0 public npm package](https://www.npmjs.com/package/@webghost01/nivyr) — released SDK and CLI.
- [GitHub v0.1.0 release](https://github.com/Webghost01-NG/nivyr/releases/tag/v0.1.0) — public release notes.
- [Readiness audit](zcg-readiness-audit.md) — current capability boundaries and readiness gaps.
- [Milestone planning](milestone-plan.md) — original broader plan and entry gates; this application narrows that work.
- [Integration candidates](integration-candidates.md) — desk research; no candidates are partners.
- [External validation protocol](external-validation-plan.md) — independent tester and interview procedure.
- [Public npm acceptance evidence](../evidence/public-npm-release.json) — maintainer-run registry installation, CLI/API, lifecycle, and package hygiene record.
- [Devtool image evidence](../evidence/devtool-image.json) — pinned image/digest and provenance record.
- [Packaged lifecycle evidence](../evidence/packaged-lifecycle-20261003.json) — real lifecycle state observations.
- [Forged-txid evidence](../evidence/forge-txid.json) — controlled reference regression, not a third-party vulnerability.
- [Adapter reuse evidence](../evidence/adapter-reuse.json) — two local reference patterns, not external app integrations.
- [Reliability evidence](../evidence/reliability.json) — 20/20 warm-image runs on Fedora Linux 44 x86_64.

## Required applicant completion before filing

See the companion [submission checklist](zcg-submission-checklist.md). At minimum, verify identity/eligibility and discovery source; provide actual background, capacity, compensation rate, funding history, other sources, and conflicts; confirm dates and startup assumption; resolve the missing MIT license file; review every legal checkbox personally; and update the budget arithmetic from real inputs. Until these are complete, this is a working draft, not a submission-ready application.
