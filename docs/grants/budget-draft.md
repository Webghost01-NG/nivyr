# Nivyr ZCG Budget Worksheet — Draft

**Status:** Not a submission-ready budget. The repository contains no verified team roster, hourly rates, availability, vendor quotes, or grant-period commitment. The $12,000 calculation below is a conditional scope-feasibility model only; it is not an applicant-confirmed rate or cost claim.
**Scope:** Prospective work in [the milestone plan](milestone-plan.md), not reimbursement for the already released `v0.1.0` product.
**Rule:** Fill every cost from actual named contributors' rates and documented direct-cost estimates. Do not invent rates or use an arbitrary grant total to fit an application form.

## Effort basis

The readiness audit estimates these engineering ranges for one experienced engineer, excluding external partner waiting time:

| Milestone | Effort range | Hours (40-hour engineer-week) | Cost formula |
|---|---:|---:|---|
| M1 — independent user validation and go/no-go | 2–3 weeks | 80–120 | `Σ(role hours × actual agreed rate)` + justified direct costs |
| M2 — one external payment application integration | 4–6 weeks | 160–240 | `Σ(role hours × actual agreed rate)` + justified direct costs |
| M3 — package, CI, lifecycle reliability | 3–5 weeks | 120–200 | `Σ(role hours × actual agreed rate)` + justified direct costs |
| M4 — maintained guidance and handoff | 2–4 weeks | 80–160 | `Σ(role hours × actual agreed rate)` + justified direct costs |
| **Total** | **11–18 weeks** | **440–720** | **Cannot be priced until staffing/rates/direct costs are verified.** |

This is a planning range, not a promise that the full scope should be funded. M1 and the M2 feasibility gate should be approved first. M3/M4 are conditional on demand and partner compatibility evidence.

## Conditional $12,000 working-request model

The original 440–720 hour scope cannot honestly be represented as covered by $12,000 without the applicant's actual rate and any direct costs. To test the requested ceiling, the application draft proposes a much narrower 240-hour plan: one validation gate, one candidate feasibility gate, at most one public-API integration, and a limited reproducibility/maintenance handoff. This is a scope proposal, not a claim that 240 hours is sufficient for every candidate.

| Milestone | Narrowed planning hours | Conditional allocation | Scope boundary |
|---|---:|---:|---|
| M1 — independent validation and go/no-go | 50 | $2,500 | Interviews, two independent package evaluations/blocker reports, decision memo. |
| M2 — external application feasibility | 50 | $2,500 | One approved candidate evaluation; a well-evidenced no-go ends integration work. |
| M3 — one gated external integration | 100 | $5,000 | Only if prior gates pass; public API/event boundary, no unilateral third-party changes. |
| M4 — reproducibility and handoff | 40 | $2,000 | Limited checks, evidence, docs, and maintenance handoff. |
| **Total** | **240** | **$12,000** | **Single-developer planning model.** |

The dollar allocation is exactly `240 hours × $50/hour = $12,000`. **$50/hour is the arithmetic break-even rate implied by the working request, not a verified or recommended applicant rate.** The applicant must replace it with their actual rate basis and available hours. Hardware/software, services, and startup are each provisionally `$0` only if the applicant confirms existing resources suffice and no advance is needed. With direct costs `D`, 240 hours would leave a compensation ceiling of `($12,000 − D) ÷ 240`; if the actual rate/cost/scope does not fit, reduce scope or revise the request before submission. Do not present this model as an agreed budget until those facts are confirmed.

The narrowed M2/M3 estimates are intentionally less than the original 160–240 hour external integration estimate. They are credible only for a bounded feasibility step and one relatively small public-interface test with no required third-party source changes. CipherPay's local-regtest compatibility is unresolved; if a candidate requires broader work, the project must stop or seek an approved scope/budget revision rather than overrun this plan. The four amounts sum to `$12,000`; provisional startup funding is `$0` and is not an extra amount above that total.

## Rate-based worksheet (complete before submission)

For each role, record the person's name, deliverable responsibility, committed hours, hourly/day rate, source of rate, other project commitments, and whether the rate is gross or includes overhead. Avoid double-counting review, coordination, or documentation time across roles.

| Role / named contributor | M1 hours × rate | M2 hours × rate | M3 hours × rate | M4 hours × rate | Rate source / availability |
|---|---:|---:|---:|---:|---|
| Technical lead / runtime owner | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| External integration engineer | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| CI/reliability engineer | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| Documentation / developer relations | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| Independent reviewer (if required) | `TBD` | `TBD` | `TBD` | `TBD` | Quote required; scope TBD |
| **Labor subtotal** | **TBD** | **TBD** | **TBD** | **TBD** | Sum only after rates are entered |

Formula for each row: `committed hours × rate`. If a contributor bills by day, state standard hours/day and convert consistently. If the owner contributes unpaid/in-kind time, list it separately and do not also charge the same hours to the grant.

## Direct cost worksheet

Only include costs required for the agreed milestones. Use quotes or actual current provider prices and explain the quantity/duration. Existing product costs and unrelated business overhead are not automatically grant costs.

| Cost item | Milestone | Quantity / duration | Unit price evidence | Subtotal | Notes / why required |
|---|---|---|---|---|---|
| CI runner / storage / artifact retention | M3 | `TBD` | Quote or provider calculator dated at application | `TBD` | Estimate from pilot run; include cold image pulls and retention. |
| GHCR image storage/egress, if charged | M3 | `TBD` | Current registry plan/pricing | `TBD` | Confirm package/registry account terms first. |
| Independent security/release review (optional) | M3/M4 | Scoped quote required | Written quote | `TBD` | Only if the review has a defined scope and competent reviewer. Not a cryptographic audit claim. |
| Developer workshop/travel (optional) | M4 | `TBD` | Vendor quote / approved travel basis | `TBD` | Include only if in-person work materially improves validation. |
| **Direct cost subtotal** |  |  |  | **TBD** |  |

Do not assume public CI, GHCR, npm or Vercel costs are zero or chargeable; verify the actual account and intended usage. Do not add a contingency percentage without a documented uncertainty and the grant program's rules. If a contingency is justified, define the trigger and ceiling explicitly.

## Milestone budget summary (blank until inputs exist)

| Milestone | Labor subtotal | Direct costs | Total request for milestone | Funding gate |
|---|---:|---:|---:|---|
| M1 | TBD | TBD | TBD | Initial validation scope only. |
| M2 | TBD | TBD | TBD | Release only after M1 identifies a willing app and regtest feasibility passes. |
| M3 | TBD | TBD | TBD | Release only after external integration acceptance. |
| M4 | TBD | TBD | TBD | Release only after evidence demonstrates repeat use and maintenance owner. |
| **Total** | **TBD** | **TBD** | **TBD** | Must equal the sum of approved milestones and requested startup costs. |

No separate startup funding is included in this draft. If future application guidance permits startup costs, list each item, owner, evidence and amount, then reconcile the total exactly with milestone amounts before submission. The public #217 thread is a reminder to make these totals arithmetically consistent; this does not assert that budgeting caused its decline.

## Evidence required before assigning a dollar value

1. Confirm who will perform each deliverable and their role, public work history, availability, and time commitment.
2. Obtain each contributor's actual rate or fee basis and state any in-kind share distinctly.
3. Obtain current quotes/pricing for paid CI/artifact, external review, workshop or travel costs actually needed.
4. Use the M1 stop/go criteria to avoid budgeting a broad framework before users and a compatible partner are found.
5. Ensure each line item maps to one acceptance criterion and has a verifiable artifact.
6. Reconcile all milestone and startup figures exactly; state currency, tax/fee treatment, payment schedule and estimated calendar dates based on the grant process.
7. Have an independent reviewer check arithmetic, scope, contributor capacity and overlap before filing.

## Out of scope for this worksheet

- Reimbursement for the published package/image, existing host testing, existing release documentation, or work completed before any award.
- A new node, wallet, indexer, generic devnet, consensus test framework, or general test runner.
- Revenue/adoption targets unsupported by current demand evidence.
- Unpriced “security audit,” “multi-platform support,” or broad integration work without a concrete reviewer, platform, app partner, and acceptance test.
