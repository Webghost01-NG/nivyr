# Nivyr Developer Validation

Use this guide to collect real developer feedback and reproducible package test reports. Do not reuse another machine's `.nivyr/` wallet/runtime. No interviews or third-party installs are recorded here as of 2026-10-09.

## Developer conversations

No developer interviews have been conducted. These entries remain pending and are not evidence:

- Developer 1: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.
- Developer 2: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.
- Developer 3: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.

## Try the public package

For ordinary developer validation, use the released npm package. Do not clone Nivyr or install Rust/Cargo for the normal image-backed path. Prerequisites: supported Node.js (`^22.12.0 || ^24.0.0 || >=26.0.0`), npm, Docker Engine/Desktop with Compose v2.24.4+, registry access, and the documented loopback ports free. At least 8 GiB free disk is recommended.

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

This starts local regtest infrastructure and uses disposable local funds, not mainnet/testnet ZEC. `down` stops the Nivyr-owned Compose project and preserves `.nivyr/` data. Never include that directory in a report.

## Optional source contribution path

To contribute to Nivyr itself, clone the canonical `main` branch and use the repository development commands in the root README. The source-checkout lifecycle materials under `docs/bootstrap-plan.md` and `docs/spike/` describe the earlier maintainer source-build experiment; they are not the public npm quickstart.

Keep app-specific assertions in the consuming application's test runner and use its public API. Nivyr's `PaymentAppAdapter` reference scenarios do not establish support for a third-party application.

## Record results

- Tester / project:
- Date and run ID:
- Package source/version:
- OS release / architecture:
- Node / npm:
- Docker / Compose:
- Image cache cold or warm:
- Time to READY:
- Commands and each pass/fail result (`doctor`, `up`, `test`, `down`, import):
- Time for lifecycle test (if measured):
- Failure output and step (redact local secrets/identity data):
- Where was documentation insufficient?
- Were the lifecycle distinctions understandable?
- Would you use it in CI? Why?
- What did you expect Nivyr to provide that it does not?
