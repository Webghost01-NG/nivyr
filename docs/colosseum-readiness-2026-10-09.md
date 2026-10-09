# Nivyr — Colosseum Submission Readiness

**Prepared:** 2026-10-09

**Release:** `@webghost01/nivyr@0.1.0`

**Status:** Product and reproducibility evidence are ready to present. Submission videos and founder/team details still require owner action.

## Product summary

- **Name:** Nivyr
- **Category:** Developer infrastructure / Zcash payment integration testing
- **One-sentence description:** Nivyr is an installable TypeScript package and CLI for testing real Zcash payment lifecycle behavior from broadcast and mining through indexing, wallet observation, memo enhancement, and application settlement.
- **Problem:** Applications can observe a valid mined transaction before the merchant wallet has scanned it. Existence and mining do not establish that an invoice received the expected amount, memo, or destination.

## Product and demonstration

Nivyr runs a disposable local Zcash regtest using pinned Zebra, Zaino, and a digest-pinned wallet-tool image. Its CLI owns project-scoped runtime state; its TypeScript API exposes lifecycle operations and observations to Vitest or another Node test runner. It does not replace Z3, implement consensus or wallet cryptography, inspect an application database, or replace Vitest.

The main demo sends a real shielded regtest payment and establishes these distinct observations:

```text
broadcast → mined → indexed → merchant wallet unscanned
→ explicit sync → detected → enhanced → memo available
```

The forged-txid regression creates `ORDER-42`, gives the buggy reference merchant a real mined transaction for the wrong recipient/memo, and shows that a mined-only check settles incorrectly. The corrected reference flow stays unpaid until its own wallet observes the invoice's expected payment semantics. This is evidence about included reference fixtures, not a named third-party application.

## How it fits with existing tools

- **Z3:** Z3 is an infrastructure platform for running Zcash node/wallet components and a local regtest. Nivyr uses pinned infrastructure as its substrate and adds a TypeScript application-testing surface for lifecycle boundaries and settlement assertions. Nivyr is not another node platform. See [Z3](https://github.com/ZcashFoundation/z3).
- **ZecKit:** The public ZecKit repository describes Regtest tooling, a Rust CLI, and GitHub Actions orchestration. Nivyr's current focus is the npm/TypeScript API and the distinction among chain, indexer, wallet, and application observations. This is a layer and interface distinction, not a claim that ZecKit cannot test payment behavior. See [ZecKit](https://github.com/intelliDean/ZecKit).
- **Vitest:** Vitest is a JavaScript/TypeScript test runner. Nivyr supplies Zcash runtime controls and payment lifecycle observations that tests can call; consumers keep their own test runner. See [Vitest's guide](https://vitest.dev/guide/).

## Installation and reproducible command flow

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

Normal package mode uses the pinned container image and does not require local Rust or Cargo. Docker Engine/Desktop, Compose, and registry access are required.

## Verified technical evidence

- **Reproducibly verified host:** Fedora Linux 44 x86_64. A fresh consumer project installed from the public npm registry and passed `doctor`, `up`, `test`, `down`, library import, and TypeScript declaration checks. Image cache was warm; doctor emitted a low-disk advisory.
- **Lifecycle:** Real Ironwood-era transaction passed broadcast, mined, indexed, unscanned, synced, detected, enhanced, and memo-available observations. See [public registry evidence](evidence/public-npm-release.json) and [lifecycle record](evidence/packaged-lifecycle-20261003.json).
- **Forged txid:** Included buggy and corrected reference fixtures passed their red/green regression. See [forged-txid evidence](evidence/packaged-forged-txid.json).
- **Adapter reuse:** The same scenario machinery passed memo-based and per-invoice-destination reference API patterns. They are fixtures, not external production integrations. See [adapter evidence](evidence/adapter-reuse.json).
- **Reliability:** 20/20 packaged lifecycle/security runs passed on Fedora 44 x86_64 with the image already cached. See [run record](evidence/reliability.json).
- **Pinned wallet runtime:** `ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9`, `linux/amd64`, source commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`.
- **Ubuntu and macOS:** The owner reports successful Nivyr tests on both platforms on 2026-10-09. The repository and local artifact search found no exact OS releases, architectures, Node/Docker/Compose versions, command logs, individual outcomes, or timings. These are recorded as owner-reported and unverified in [`support-matrix.md`](support-matrix.md), not presented as reproducibly verified platform support.

## Audience and go-to-market

The initial target is developers building Zcash payment, wallet, merchant, exchange, and payment-processing applications. A practical distribution path is npm search, public GitHub examples and documentation, Zcash developer communities and forum posts, direct integration outreach, and ecosystem/grant programs. The package and docs are public, but no conversion or active-use data is recorded.

**Demand evidence:** none recorded. There are no documented developer interviews, third-party installs, customers, revenue, or explicit adoption commitments. Do not claim traction.

**Market sizing:** no sourced estimate is recorded. Keep the initial market claim narrow and do not invent a broad crypto TAM.

## Limitations

- Only Fedora Linux 44 x86_64 has reproducible end-to-end evidence in the repository.
- Ubuntu and macOS success is owner-reported, but supporting logs/details are absent. ARM64/Apple Silicon, Windows, WSL, and CI runners are unverified.
- The wallet image targets `linux/amd64`; no Apple Silicon emulation claim is made.
- Cold-image pull timing, view-only merchant behavior, and reorg scenarios are unverified.
- The two app reconciliation patterns are reference fixtures, not independent applications.
- Some wallet amount/memo/scan parsing depends on human-readable output from the pinned CLI.
- No formal security audit is claimed.

## Submission requirements and missing items

The [Colosseum Crypto World's Fair program page](https://colosseum.com/hackathon?year=fall2026), checked 2026-10-09, lists product/team details, ecosystem/tool information, a logo or graphic, a GitHub repository, a **2–3 minute presentation video**, a **product demo video of no more than 3 minutes**, go-to-market and demand-validation information. Judging areas listed include Founder + Market Fit, Insight, Product + Execution, Potential Market Size, Founder Communication, Viability, and Traction. The public page does not give numeric weights or a separate Zcash-track rubric.

| Item | Status |
|---|---|
| Product name, description, GitHub repository, npm package, documentation, and graphic | Available |
| Accurate technical evidence and limitations | Available in this repository and linked artifacts |
| Ubuntu/macOS reproducibility details | **OWNER ACTION REQUIRED** — provide sanitized logs/report and exact environment/commands |
| Presentation video (2–3 minutes) and actual upload URL | **OWNER ACTION REQUIRED** — script below is not a recording |
| Product-demo video (maximum 3 minutes) and actual upload URL | **OWNER ACTION REQUIRED** — script below is not a recording |
| Founder/team background and location | **OWNER ACTION REQUIRED** — enter accurate portal details |
| Developer interviews / demand evidence | None recorded; do not fabricate |
| Sourced market sizing | None recorded; do not fabricate |
| Past-work disclosure requested by Colosseum | **OWNER ACTION REQUIRED** — describe the actual timeline/contributions accurately in the portal |

## Presentation video script (target 2–3 minutes)

**Recording status: OWNER ACTION REQUIRED. No video has been recorded or uploaded.** Personalize the short founder-background line with true information before recording.

> [Founder name / relevant background, in your own words.] I built Nivyr because testing a Zcash payment does not end when a transaction is mined.
>
> A merchant application may see a valid transaction ID in the chain while its own wallet has not scanned the payment. Later, the wallet may detect it but still need enhancement before the memo is available. Each layer knows something different. A mined transaction by itself does not prove that an invoice received the expected amount, memo, or destination.
>
> Nivyr is integration-testing infrastructure for Zcash payment applications. It is an npm package with a TypeScript API and CLI. It coordinates a disposable local Zcash regtest using Zebra, Zaino, and a pinned wallet-tool container. Developers can install it with npm, use `doctor`, start the environment with `up`, and exercise the lifecycle from their own TypeScript tests. The normal package path uses Docker and does not compile Rust locally.
>
> The core demonstration is a real shielded regtest payment. We show it broadcast, mined, indexed, and still absent from the merchant wallet. Then we explicitly sync the wallet, detect the payment, enhance it, and inspect its memo.
>
> We also test a security mistake: an included reference merchant trusts a customer-supplied mined transaction ID and marks ORDER-42 paid for an unrelated payment. The corrected reference flow waits for its own wallet to observe the invoice's expected payment. This is a regression for our fixtures, not a claim about an outside merchant.
>
> Z3 provides infrastructure, Vitest runs tests, and Nivyr connects those layers to payment application assertions. The package passed the public install and lifecycle flow on Fedora Linux 44 x86_64. We are looking for Zcash payment developers who want to try that workflow and tell us which payment failures are hardest to reproduce.

## Product demo video script (maximum 3 minutes)

**Recording status: OWNER ACTION REQUIRED. No video has been recorded or uploaded.** Capture the actual terminal and output; do not synthesize UI or outcomes.

1. **0:00–0:20 — State the gap.** Show the product docs or terminal title. Say: “Nivyr tests what happens between a valid mined Zcash transaction and an application deciding that an invoice is paid. Chain, indexer, wallet, and app state are separate.”
2. **0:20–0:40 — Show install and preflight.** In a disposable consumer project, show `npm install -D @webghost01/nivyr`, then `npx nivyr doctor`. Mention the verified host scope if you present results: Fedora Linux 44 x86_64. Avoid implying another platform is reproduced unless its logs are also shown.
3. **0:40–1:05 — Start the pinned environment.** Run `npx nivyr up`. Show actual READY output and the pinned image reference from package evidence. Explain that this is local regtest with disposable funds, not mainnet ZEC.
4. **1:05–1:45 — Show the lifecycle.** Run `npx nivyr test`. Highlight the actual assertions: broadcast, mined, indexed, merchant wallet unscanned; explicit sync; detected; enhanced; memo available. Explain Vitest remains the developer's runner and the CLI runs Nivyr's packaged verification.
5. **1:45–2:20 — Show the forged-txid regression.** Show the actual test output/evidence: the buggy reference fixture settles on a valid mined but unrelated transaction; the corrected fixture stays unpaid until the expected wallet-observed payment. State that these are reference fixtures, not a third-party vulnerability claim.
6. **2:20–2:45 — Close with cleanup and invitation.** Run `npx nivyr down`. Say: “Nivyr gives Zcash payment developers a repeatable way to test wallet and application boundaries. The public npm package and full lifecycle have reproducible Fedora x86_64 evidence. We want feedback from teams building real payment flows.”

## Future package cleanup (not part of v0.1.0)

The released 25-file archive includes repository-oriented npm scripts whose source inputs (`tsconfig.json`, tests, integration runner, and example app) are not shipped. The documented CLI bin works, but those maintainer scripts should not be advertised by a future published package. In the future publish manifest, remove `build`, `test`, `test:integration`, `merchant`, and `typecheck`; retain the source-checkout commands in the repository's development manifest. Before a future patch release, pack from a clean staging directory with a runtime-only manifest, verify the resulting archive, and run the external package acceptance gate. This repository update does not change the immutable `0.1.0` tarball or authorize a new release.
