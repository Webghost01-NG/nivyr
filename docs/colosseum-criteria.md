# Colosseum Readiness Criteria Map

Accessed: 2026-10-09. Source: [Crypto World's Fair program and submission FAQ](https://colosseum.com/hackathon?year=fall2026). The public page lists evaluation across Founder + Market Fit, Insight, Product + Execution, Potential Market Size, Founder Communication, Viability, and Traction. It publishes no numeric weights and no distinct Zcash-track scoring rubric was found. Submission fields include product/team information, a product graphic, GitHub repository, presentation and demo videos, and go-to-market/demand-validation information.

| Area | Current supportable evidence | Missing / owner action | Artifact |
|---|---|---|---|
| Founder + Market Fit | The project records hands-on work with NU6.3/Ironwood lifecycle behavior, packaged runtime integration, and turning bootstrap failures into requirements. | Add the founder's real background and motivation in their own words. No founder credentials or external interviews are inferred from repository commits. | `docs/evidence/`, `docs/spike/friction-log.md`; owner context needed |
| Insight | Chain, indexer, wallet, and application state can diverge; mined does not mean scanned, detected, enhanced, or settled. | Developer conversations to establish how often this pain occurs and its cost. | `docs/architecture.md`, `docs/evidence/packaged-lifecycle-20261003.json` |
| Product + Execution | Public npm package and digest-pinned runtime; public registry install, CLI flow, API import, and real lifecycle/security tests recorded on Fedora Linux 44 x86_64; 20/20 warm-image reliability runs. Owner reports successful Ubuntu and macOS testing, but the detailed reports/logs are not retained. | Preserve exact cross-platform host details and per-command outcomes before upgrading those reports to reproducible verification. No third-party application integration is claimed. | `docs/evidence/public-npm-release.json`, `docs/evidence/reliability.json`, `docs/evidence/hosts/` |
| Potential Market Size | Initial user group is Zcash payment developers; adjacent potential users include wallet and payment infrastructure teams. | No sourced market-size estimate exists. Define a defensible initial customer count and expansion method; do not present broad crypto activity as Nivyr's addressable market. | `docs/validation.md`; research required |
| Founder Communication | Product definition, developer docs, a demo flow, and video scripts are prepared in [`colosseum-readiness-2026-10-09.md`](colosseum-readiness-2026-10-09.md). | Record and upload a 2–3 minute presentation video and a product demo of no more than 3 minutes. Add their actual URLs to the submission portal. | Owner action; no video or upload confirmation retained |
| Viability | Public npm installation and documentation are available. A concrete initial distribution path is npm, GitHub examples, ecosystem communities, direct developer outreach, and relevant grant programs. | Pricing, maintenance cost, support model, sustainability, and conversion evidence are not established. | `README.md`, package release, [`outreach.md`](outreach.md) |
| Traction / demand validation | No conversations, third-party installs, users, revenue, or explicit interest are recorded. | Conduct and record real developer interviews or trials; report no traction until evidence exists. | `docs/validation.md` |
| GTM / distribution | The package is public on npm; GitHub and the public documentation site are live. | No outreach conversion, active-user count, or adoption claim is supported. Execute outreach and document results. | `README.md`, `docs/outreach.md`, [`docs/third-party-test.md`](third-party-test.md) |

## Evidence-qualified platform status

- **Reproducibly verified:** Fedora Linux 44 x86_64. The public npm evidence records install, `doctor`, `up`, `test`, `down`, library import, and TypeScript declaration checks.
- **Owner-reported, not independently reproducible from retained artifacts:** successful Nivyr testing on Ubuntu Linux and macOS was reported on 2026-10-09. Exact releases, architectures, tool versions, command sequence, and logs were not provided or found in local artifacts. The reports are recorded separately under `docs/evidence/hosts/` without converting them to verified compatibility claims.
- **Unverified:** other Linux distributions, ARM64/Apple Silicon, Windows, WSL, and CI runners.

## Submission integrity

The public Colosseum page says builders may use pre-existing code but must disclose relevant past development work. Describe the actual project timeline and contributions accurately in the portal. The repository evidence supports product behavior; it does not support user traction, revenue, external integrations, or a sourced market size.
