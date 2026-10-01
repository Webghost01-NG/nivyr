# Nivyr Developer Validation

Use this guide on a machine that is genuinely separate from the maintainer host. Do not reuse another machine's `.cache` directory or wallet. This is a preparation form; no interviews or results are recorded here.

## Developer conversations

No developer interviews have been conducted. These entries remain pending and are not evidence:

- Developer 1: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.
- Developer 2: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.
- Developer 3: PENDING — project, current payment/memo tests, most painful step, reaction, adoption intent and notes.

## Try the clean checkout

Prerequisites: supported Node.js (`^22.12.0 || ^24.0.0 || >=26.0.0`), npm, Docker Engine with Compose v2.24.4+, Git, curl, OpenSSL, tar, stable Rust/Cargo, internet access for pinned sources, crates.io and images, and the documented loopback ports free. The first Rust wallet build took about 24 minutes on the maintainer host; another machine may take longer.

```sh
git clone https://github.com/Webghost01-NG/nivyr.git
cd nivyr
git switch spike/zcash-lifecycle
npm ci
npm run nivyr:up
npm run test:integration
npm run nivyr:down
```

Use each command separately so that a failure is visible. Do not continue to integration after `nivyr:up` fails. Keep `.cache/` after transient download/build failures and retry `npm run nivyr:up`; do not delete it unless maintainers request a targeted reset. The runtime is local regtest and contains no real ZEC.

## Inspect the example

Read `tests/integration/lifecycle.integration.ts` and `examples/merchant/`. Identify which observer establishes each point: Zebra broadcast/mining, Zaino indexed height, wallet transaction list after explicit sync, and decrypted memo after enhancement. Verify that the test uses the merchant HTTP API and does not inspect its internal state.

Optional: try one observation in an existing application test. Keep app-specific assertions in that application's test runner; report lifecycle friction rather than adding a generic adapter to Nivyr.

## Record results

- Tester / project:
- Date and run ID:
- OS release / architecture / RAM:
- Node / npm:
- Docker / Compose:
- Rust / Cargo:
- Clean or cached state:
- Time to `npm ci`:
- Time to READY:
- Time for integration:
- Did all three real lifecycle cases pass?
- Failure output and step (redact local secrets/identity data):
- Where was documentation insufficient?
- Was maintainer help needed?
- Were the lifecycle distinctions understandable?
- Would you use it in CI? Why?
- What did you expect Nivyr to provide that it does not?
