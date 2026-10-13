# ZCG Application Submission Checklist — Nivyr

**Status: not ready to submit.** This checklist maps the draft to the official ZCG GitHub issue template retrieved on 2026-10-13 from [`grant_application.yaml` at commit `bce86883b7bb9b0e1a6d4ef8b5939786484847c5`](https://github.com/ZcashCommunityGrants/zcashcommunitygrants/blob/bce86883b7bb9b0e1a6d4ef8b5939786484847c5/.github/ISSUE_TEMPLATE/grant_application.yaml). All template fields are represented in [`zcg-application-draft.md`](zcg-application-draft.md); required applicant-specific fields remain open.

## Official form coverage

| Official field ID | Required by form | Draft coverage | Applicant action |
|---|---:|---|---|
| `terms_and_conditions_checkboxes` | Yes | All nine terms reproduced, none checked | Personally read each linked agreement/guideline and accept or stop. Do not delegate legal acceptance. |
| `assignees` | Yes | Placeholder | Supply and verify applicant GitHub username. |
| `organization_details_name` | Yes | Placeholder | Supply individual/legal applicant name. |
| `organization_details_discovery` | Yes | Placeholder | State truthfully how ZCG was discovered. |
| `project_overview_amount` | Yes | Conditional $12,000 | Confirm final ask from actual rate, hours, direct costs, and capacity. |
| `project_overview_category` | Yes | Infrastructure | Confirm this remains the best category when filing. |
| `team_information_project_lead` | Yes | Name/background/availability open | Complete name, role, relevant verifiable background, and responsibility/capacity. |
| `team_information_members` | Yes | `None or N/A` | Confirm no additional members; update if this changes. |
| `project_details_summary` | Yes | Drafted | Applicant review for accuracy. |
| `project_details_description` | Yes | Drafted with evidence limits | Applicant review; retain explicit no-adoption/no-partner qualification. |
| `project_details_problem` | Yes | Drafted | Applicant review; do not claim prevalence absent validation. |
| `project_details_solution` | Yes | Drafted with go/no-go gate | Confirm delivery scope and stop conditions. |
| `project_details_format` | Yes | Drafted | Confirm deliverables are feasible for one person. |
| `project_details_dependencies` | Yes | Drafted | Update only after participant/maintainer agreement exists. |
| `project_details_technical` | Yes | Drafted | Check exact package/runtime pins before filing. |
| `project_details_merge` | Yes | No upstream changes planned | Keep this truthful; do not imply upstream review or merge. |
| `project_details_license` | Yes | Unresolved MIT declaration/file discrepancy | Add/verify actual MIT license text and rights before choosing MIT; applicant must confirm authority. |
| `budget_hardware` | Yes | Provisional $0 | Confirm existing equipment/software suffices; otherwise attach current price evidence and recalculate. |
| `budget_hardware_justification` | Yes | Conditional zero-cost justification | Confirm it is true for the proposed work. |
| `budget_service` | Yes | Provisional $0 | Confirm no paid runner/storage/other service is needed; otherwise provide price evidence and recalculate. |
| `budget_service_justification` | Yes | Conditional zero-cost justification | Confirm service and registry/CI assumptions. |
| `budget_compensation` | Yes | Conditional $12,000 | Enter actual agreed compensation; verify committed 240 hours and actual rate. |
| `budget_compensation_justification` | Yes | $50/hour break-even model | Replace the illustrative arithmetic with applicant's rate source, hours, and tax/fee basis. |
| `budget_total` | Yes | Conditional $12,000 | Recompute and reconcile requested amount with all cost lines and milestone allocations. |
| `budget_previous_funding` | Yes | Unresolved | Select Yes/No truthfully. |
| `budget_previous_details` | No | Conditional instructions | If Yes, provide grant outcomes; if No, enter N/A. |
| `budget_other_sources` | Yes | Unresolved | Select Yes/No truthfully. |
| `budget_other_sources_details` | No | Conditional instructions | Disclose planned/received sources and non-overlap, or enter N/A. |
| `risk_implementation` | Yes | Drafted | Confirm risks and operational mitigations. |
| `risk_side_effects` | Yes | Drafted | Confirm impact and claims safeguards. |
| `risk_metrics` | Yes | Drafted, staged measures | Confirm counts are achievable and distinguish validation from adoption. |
| `schedule_startup` | Yes | Conditional $0 | Confirm no advance is required; otherwise document and re-balance. |
| `schedule_startup_justification` | Yes | Conditional explanation | Confirm ability to work under actual ZCG payment timing. |
| `schedule_milestones` | Yes | Four milestones with provisional dates | Confirm start/finish dates, rate, hours, allocations, partner gates, and reviewer acceptance. |
| `supporting_documents` | No | Evidence/release links listed | Ensure linked evidence is public, current, and does not expose secrets or personal data. |

The form has 35 body fields (including the terms checkbox group and optional details fields). The title is also provided separately. The draft addresses each listed body field.

## Hard blockers

1. **License:** `package.json` declares `MIT`, but no tracked `LICENSE` file exists on `main`. The official form says the grant agreement requires MIT. Resolve the repository license text/rights before selecting MIT or submitting. This documentation-only task does not create or alter a license.
2. **Contribution process:** no tracked `CONTRIBUTING.md` was found. The official terms require one for new open-source software. Confirm the applicant's agreement to create it for grant-funded additions and include it in the planned handoff.
3. **Applicant identity and experience:** legal/applicant name, GitHub handle confirmation, background, eligibility, and actual delivery capacity are not established by repository evidence.
4. **Budget:** $12,000 balances only under an unverified model of 240 hours at a $50/hour break-even rate and zero hardware/software/service costs. Confirm the actual rate and costs; otherwise narrow or revise the request and all milestone amounts. Do not report the illustrative rate as the applicant's rate.
5. **Funding disclosures:** previous ZCG funding, other sources, conflicts, and discovery source require applicant answers.
6. **Schedule/startup:** dates assume a 2027-01-01 start and $0 startup funding. Confirm against actual award/payment timing and personal availability.
7. **Terms:** applicant personally reviews and accepts all required legal/program checkboxes; none are accepted by this draft.
8. **External evidence:** no independent users, partner commitments, or third-party integration are currently evidenced. The proposal is written to test these through a first validation gate, not to claim them.

## Pre-submission evidence checks

- [ ] Reconfirm npm package page and `v0.1.0` release links.
- [ ] Reconfirm digest-pinned image evidence and source revision; do not substitute a mutable tag.
- [ ] Reconfirm lifecycle and forged-txid artifacts still support the precise draft language.
- [ ] State that forged-txid behavior is from local reference fixtures, not an external merchant vulnerability.
- [ ] State that the two adapter patterns are local reference patterns, not external applications.
- [ ] State that 20/20 reliability is one Fedora Linux 44 x86_64 host with a warm image, not a general reliability rate.
- [ ] Keep Ubuntu/macOS as owner-reported without reproducible machine/run logs; do not label them verified.
- [ ] Do not claim CipherPay is a partner or that it supports regtest; feasibility is unproven.
- [ ] Do not claim ZCG declined proposal #217 was declined for a particular reason.
- [ ] Ensure every quotation/testimonial has consent and a source; currently none is included.
- [ ] Confirm dates, hour caps, payment terms, startup amount, and subtotals reconcile.
- [ ] Confirm any new project code's license and `CONTRIBUTING.md` obligations with the applicant and ZCG agreement.
- [ ] Applicant posts the application only after personally completing the form, then follows the forum-posting requirement if accepted in the terms.

## Budget arithmetic recheck

| Component | Conditional amount |
|---|---:|
| Hardware/software | $0 |
| Services | $0 |
| Compensation: 240 h × $50/h (break-even assumption only) | $12,000 |
| Startup funding | $0 |
| **Total request** | **$12,000** |

Milestones: `$2,500 + $2,500 + $5,000 + $2,000 = $12,000`; effort: `50 + 50 + 100 + 40 = 240 hours`. These numbers are a conditional planning model, not verified personal financial facts. Direct costs greater than zero reduce compensation available under a fixed $12,000 cap. A different rate changes affordable hours/scope. If the applicant cannot substantiate the 240-hour scope at the real rate, do not submit this budget.
