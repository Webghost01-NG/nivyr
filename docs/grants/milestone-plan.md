# Nivyr ZCG Validation and Delivery Milestone Plan

**Status:** Draft planning artifact; no grant has been submitted or offered.
**Basis:** [ZCG readiness audit](zcg-readiness-audit.md), current package/runtime evidence, and public candidate research.
**Scope boundary:** Improve confidence in Nivyr as an application lifecycle testing companion; do not build another node, indexer, wallet, generic devnet, consensus test suite, or test runner.

## Entry gate before applying

Complete the following before requesting a larger implementation grant:

1. Record 6–8 interviews across distinct Zcash payment, wallet and indexer teams using [the validation plan](external-validation-plan.md); include negative responses.
2. Get at least two non-maintainers to install and run the public npm package in fresh projects, retaining sanitized per-command results and environment metadata.
3. Secure one application maintainer's written agreement to a no-DB, public-API test feasibility session. Agreement to evaluate is not an endorsement or adoption claim.
4. Pass a small feasibility gate proving the chosen application can observe Nivyr's disposable regtest without a unilateral third-party code change. For the current first candidate, CipherPay, published configuration documents only testnet/mainnet and CipherScan; do not promise that integration until verified.
5. Identify named project contributors, their availability, maintenance ownership, actual rates and direct cost estimates. The repository alone does not substantiate staffing or cost.

If the problem is not repeated across independent projects, or no external app can use the boundary, stop or reposition before requesting implementation funding.

## Proposed milestones

Estimates assume one experienced engineer and access to relevant maintainers. One engineer-week is 40 hours. They exclude partner wait time; calendar duration depends on responses and grant review. All criteria can be checked by reviewers from public repos, partner-approved logs, CI, and retained artifacts. Funding should be released only against the agreed acceptance criteria.

### M1 — Independent user validation and go/no-go

**Objective:** establish whether Nivyr addresses a repeated problem for independent developers.

**Deliverables**

- Interview guide and anonymized result table for 6–8 developers from distinct projects.
- At least two non-maintainer fresh-registry package test reports or detailed blocker reports, captured under the external-validation protocol.
- Candidate feasibility note from an approved app maintainer conversation, with no claimed endorsement unless explicitly granted.
- A public go/no-go memo that includes disconfirming evidence and whether the thesis should narrow.

**Acceptance criteria**

- Each conversation records existing test practice, real transaction usage, lifecycle delay coverage, hardest reproducible failure, interest/objection, and quote permission.
- Two independent users complete `doctor → up → test → down`, or provide a reproducible sanitized blocker report with all attempted stages distinguished.
- At least one external app owner agrees to a concrete test feasibility step. If not, later app-integration work is cancelled or re-scoped before more funding is committed.
- No downloads/stars or owner activity are reported as adoption.

**Effort:** 2–3 engineer-weeks (80–120 hours), plus scheduling.
**Risk/dependency:** response bias, low response, and false positives from courtesy interest.
**Stop condition:** no repeated need and no willing app maintainer after the agreed outreach sample.

### M2 — One external payment application integration

**Objective:** prove that Nivyr can test a real independent application through its public interface.

**Deliverables**

- A Nivyr-owned adapter/example or partner-owned test integration; no changes to the application repository without its maintainer's explicit approval.
- Documented local configuration connecting the app to disposable regtest, if supported.
- Scenario for expected payment and at least one invalid payment condition relevant to the app's policy.
- Partner-reviewed reproduction steps, app revision, Nivyr version, image digest, sanitized artifacts, and a short limitations note.

**Acceptance criteria**

- App maintainer can rerun the scenario from written steps.
- Test uses the app's public HTTP/API/event interface and does not inspect its database.
- A real local shielded payment progresses through relevant chain/indexer/wallet observations and the app's actual public invoice state is asserted.
- An unrelated/wrong payment does not settle where that condition is relevant; correct expected payment does settle according to the app's actual policy.
- Integration boundaries and any required app modifications are disclosed; no production security claim is made from a test fixture.

**Effort:** 4–6 engineer-weeks (160–240 hours), including test integration and documentation.
**Risk/dependency:** partner access, scanner/network configuration, divergent wallet semantics, or inability to run the app under regtest.
**Stop condition:** if the app requires broad unsupported changes or no public test boundary, select a different candidate with owner approval; do not conceal the failed feasibility attempt.

### M3 — Package, CI, and lifecycle reliability

**Objective:** turn the single-host evidence into a maintained, reviewable test signal.

**Deliverables**

- CI for typecheck, unit tests, build, docs build/link checks, and package smoke test.
- A small digest-pinned regtest consumer integration run on a supported Linux runner, if the provider permits Docker-in-Docker/service containers and resource requirements.
- Failure classification and sanitized artifacts for every attempt.
- Compatibility/pinning and image update runbook, including provenance verification.
- Additional independent-host test reports; platform claims updated only where full flow evidence exists.

**Acceptance criteria**

- Fresh public package install and library import pass on the documented supported runner without Rust/Cargo.
- Lifecycle plus security regression completes with records for broadcast/mined/indexed/unscanned/sync/detected/enhanced/application result.
- At least 20 consecutive or scheduled attempts are retained; report pass/fail count and durations, and classify every failure without discarding attempts.
- Each report records package/image digest, host architecture, image cache status and exact command outcomes.
- At least one independent host beyond the current Fedora evidence completes `doctor/up/test/down` before its OS is marked reproducibly verified.

**Effort:** 3–5 engineer-weeks (120–200 hours).
**Risk/dependency:** hosted runners may restrict Docker; GHCR pull limits, cold image size, disk, and readiness variance may make CI too slow or costly.
**Stop condition:** if reliable hosted execution is not feasible within agreed resource limits, publish a documented self-hosted runner path and keep CI claims narrow.

### M4 — Maintained integration guidance and handoff

**Objective:** make the proven external integration repeatable by other Zcash teams and maintainable after funding.

**Deliverables**

- Partner-reviewed tutorial, sample consumer test, troubleshooting guide and expected artifacts.
- Contribution, release, vulnerability-reporting and image-update procedures.
- Explicit supported runtime/host matrix with owner and independent results separated.
- Named maintenance owner, response expectations and post-grant compatibility plan.
- Follow-up feedback from external teams using the guide.

**Acceptance criteria**

- Two independent teams can reproduce the documented integration or submit a concrete sanitized blocker report.
- At least one external integration is accepted/maintained by the partner project or remains a clearly maintained Nivyr example with partner approval.
- Every compatibility/security/performance claim links to corresponding evidence.
- Maintenance owner, release cadence, support limits and funding period are explicit.
- No claim of broad adoption from views/downloads alone.

**Effort:** 2–4 engineer-weeks (80–160 hours).
**Risk/dependency:** partner review delays and lack of long-term maintainer capacity.
**Stop condition:** if no team intends to rerun the integration after the initial test, do not position it as an ecosystem standard.

## Overall effort and measurable outcomes

- **Total estimated implementation/research effort:** 11–18 engineer-weeks, approximately 440–720 hours, before partner wait time.
- **M1/M2 are validation gates.** M3/M4 should be funded only after the need and feasibility criteria pass.
- **Core success signals:** independent package runs; one external app's real public state asserted against regtest; every run/failure retained; independent rerun; named ongoing maintainer.
- **Do not use as sole success signals:** package downloads, stars, page views, unverified testimonials, number of fixture patterns, or a green run from the project owner's machine.

## Dependencies and risks

| Dependency/risk | Mitigation / decision point |
|---|---|
| App cannot point its payment scanner at local regtest | Feasibility session first. Do not fork/modify without app maintainer approval. Choose another candidate if configuration is incompatible. |
| The app's semantics differ from Nivyr's memo reference | Derive assertions from that app's invoice policy, including destination, amount, memo, confirmations or event status; don't force Nivyr's fixture contract onto it. |
| CI image pull/start time or Docker restrictions | Pilot one runner before committing to matrix coverage; include warm/cold state and resource limits. Keep a self-hosted option only if maintainable. |
| Wallet CLI output changes | Keep pinned digest, add parser-format fixtures, preserve raw sanitized failure evidence, and evaluate structured backend only if it reduces measured fragility. |
| Host architecture mismatch | Report amd64 image and emulation explicitly. ARM64/native Apple Silicon support requires a separately built and tested image. |
| User interest does not translate to use | Make M1/M2 stop-go gates; require hands-on package run or partner rerun, not only positive interview language. |
| No maintenance capacity after grant | Name an owner and time commitment before applying; otherwise limit work to a finite validation deliverable. |
| Security overclaim | State local disposable-regtest and package hygiene facts only. No formal security audit or guarantee is implied. |
