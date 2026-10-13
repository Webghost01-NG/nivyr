# External Developer Validation Plan

**Status:** Preparation only. No outreach or third-party testing has occurred under this plan. Share or contact developers only after the project owner approves outreach.
**Release under test:** `@webghost01/nivyr@0.1.0` from the public npm registry.
**Current evidence boundary:** Nivyr's retained complete external-package acceptance is maintainer-run on Fedora Linux 44 x86_64. Owner-reported Ubuntu/macOS results remain unverified without detailed artifacts.

## Objectives

1. Find out how Zcash payment developers currently test real shielded payment and invoice settlement.
2. Learn whether the chain/indexer/wallet/application state boundaries create a recurring problem for independent teams.
3. See whether a non-maintainer can install and use the published package without Rust/Cargo or a Nivyr checkout.
4. Establish whether one independent app can be exercised through its public API against Nivyr regtest.
5. Capture negative feedback and blockers as carefully as positive results.

Do not treat npm download counts, stars, owner runs, conference conversation, or polite interest as adoption. Record a completed third-party install separately from an interview and from an app integration.

## Who to invite (after approval)

Aim for 6–8 people from distinct projects, not multiple respondents counted as multiple use cases from one team. Include:

- Zcash merchant/payment application maintainers.
- Wallet or light-client developers whose systems scan/index shielded transactions.
- Developers integrating Zcash payment events into e-commerce, POS, invoicing or APIs.
- Zcash infrastructure maintainers who can review the correctness of the chain/indexer/wallet boundaries.

Avoid pitching before asking about their current workflow. Ask permission before recording, quoting, publishing project identifiers, or linking code/issues.

## Interview questionnaire

Ask in this order; do not assume the respondent uses shielded payments or invoice memos.

1. How do you test a Zcash payment flow today, from payment creation through your application's paid/unpaid decision?
2. Do automated tests use real Zcash transactions, a local regtest, public testnet, mocks, or a mix? What drove that choice?
3. How do you test delays between broadcast, mining, indexer visibility, wallet sync, and application updates?
4. Do you test wrong recipient, amount, memo/reference, duplicate payment, timeout, or reorganization cases? Which matter for your payment model?
5. What payment failure is hardest or most expensive to reproduce? Can you describe the last time it happened without sharing customer data?
6. What does your application use as proof that a specific invoice was paid? Which component is authoritative?
7. Would a disposable npm-installed local environment with real regtest payments be useful? What would have to change before you would try it?
8. Would you be willing to run `doctor → up → test → down` in a clean project or evaluate it against your public API? If not, what blocks that?
9. What test runner, CI platform, runtime, wallet, and indexer do you use? What would make a new tool conflict with your setup?
10. May Nivyr cite your feedback? Choose: no public reference; anonymous summary only; attributed quote; public issue/PR or integration link. Confirm the choice in writing.

Record answers neutrally, including “not relevant,” “already solved,” and “would not use.” Do not turn a hypothetical “would try” into a user or partner claim.

## External tester guide

The following is intended for a non-maintainer using an empty project. It tests the published release and does not require cloning Nivyr or installing Rust/Cargo.

### Requirements

- Node.js `^22.12.0 || ^24.0.0 || >=26.0.0` and npm.
- Docker Engine/Desktop with a working daemon and Docker Compose v2.24.4 or newer.
- Network access to npm and the pinned GHCR/Docker images on first use.
- Required Nivyr loopback ports free; ideally at least 8 GiB available disk. The known verified environment was Fedora 44 x86_64; other host success should be recorded with details rather than inferred.
- The released wallet image targets `linux/amd64`. Record whether the machine is x86_64 or ARM and whether Docker reports/employs emulation; do not call an emulated run native ARM support.

### Run from an empty project

```sh
mkdir nivyr-independent-check
cd nivyr-independent-check
npm init -y
npm install -D @webghost01/nivyr@0.1.0

npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

For an SDK import smoke check, create `import-check.mjs`:

```js
import { createNivyr, zecToZatoshi } from "@webghost01/nivyr";

const nivyr = createNivyr();
console.log(typeof nivyr.chainHeight, zecToZatoshi("0.01").toString());
```

Run `node import-check.mjs`. This confirms public exports resolve; it does not run an application integration. Do not print wallet identities, private data, or secret environment values.

The CLI writes owned runtime data to the project's `.nivyr/` directory. `down` stops the Nivyr-owned Compose project and preserves that runtime data/volumes. Do not delete Docker resources manually and do not upload `.nivyr/`.

### Capture sanitized environment facts

Record only what is needed to reproduce the result:

| Field | Example command / value |
|---|---|
| OS/release | Linux: `cat /etc/os-release`; macOS: `sw_vers -productVersion` |
| Architecture | `uname -m` |
| Node/npm | `node --version`; `npm --version` |
| Docker server | `docker version --format '{{.Server.Version}}'` |
| Compose | `docker compose version --short` |
| Package | `npm ls --depth=0 @webghost01/nivyr` |
| Install source | Record exactly `npm registry @webghost01/nivyr@0.1.0`; do not use local path/link/tarball for this public install check. |
| Image cache | State whether this is the first pull on the machine or the pinned image was already present. |
| Commands | Record each command and exit status: install, doctor, up, test, down, import. |
| Timings | Only record elapsed time if measured; distinguish install, pull, startup, and `test`. |

Do not include usernames, home paths, wallet addresses/identities, mnemonic phrases, API keys, full environment dumps, Docker inspect output, `.env`, `.nivyr`, or raw runtime wallet/log directories. Review and redact the transcript before sharing it. If an error includes a local path or identity, replace that value while preserving the error type and relevant message.

### Failure capture and cleanup

- Preserve each failed attempt. Do not rerun until green and discard an earlier failure.
- Record the command/stage, exit code, timestamp/timezone, sanitized error, whether the image was cold/warm, and whether runtime reached READY.
- If `up` partially starts and fails, run `npx nivyr doctor`, then `npx nivyr down` to stop only the Nivyr-owned project. Retain `.nivyr` locally until the report is reviewed; do not upload it.
- If Docker/Compose is unavailable or the daemon is down, stop at `doctor` and report that host prerequisite result. Do not describe the downstream runtime as failed when it never started.
- Separate a test of the Nivyr sample CLI suite from a partner-app integration. The latter needs an approved app, public API, and a separate integration result.

## Evidence record template

Create one record per host/run. Keep the raw local transcript private; publish only a reviewed/sanitized excerpt with consent.

```text
Run ID:
Date/time (UTC or timezone stated):
Tester role/project (optional; use anonymous ID if preferred):
Relationship to Nivyr: maintainer / independent tester / partner evaluation
Package source/version/integrity (if available):
OS release / architecture:
Node / npm:
Docker / Compose:
Image cache: cold / warm / unknown
Doctor: PASS / FAIL / NOT RUN + sanitized output
Up: PASS / FAIL / NOT RUN; READY reached?; elapsed time if measured
Test: PASS / FAIL / NOT RUN; test output and elapsed time if measured
Down: PASS / FAIL / NOT RUN; Nivyr project stopped? unrelated resources unaffected?
SDK import: PASS / FAIL / NOT RUN
Failures retained at (private local path only; do not publish path):
Docs/UX confusion:
What would make this useful in your application?
Would you use it again/in CI? Why or why not?
Permission: private only / anonymous summary / attributed quote / link to public PR or issue
Permission confirmed by/date:
Redaction review completed:
```

Before publishing evidence, obtain a clear permission choice. Do not include personally identifying host names, addresses, secrets, wallet state or logs that expose third-party data. Retain owner test records in a distinct `owner` category and independent tests with the tester's consent; never promote maintainer runs to independent validation.

## Current evidence and status

- **Owner/maintainer:** `docs/evidence/public-npm-release.json` records the public registry install and CLI/API acceptance on Fedora Linux 44 x86_64. `docs/evidence/reliability.json` records 20/20 runs on the same host with a warm image.
- **Owner-reported only:** Ubuntu and macOS were reported successful, but the repository's host records do not contain versions, package source, commands, logs, or timings.
- **Independent testers:** none recorded as of this plan.
- **Independent application integrations:** none recorded. Local memo and invoice-destination reference fixtures are not third-party apps.

Related repository template: [developer validation](../developer-validation.md). No contacts or outreach have been made under this preparation task.
