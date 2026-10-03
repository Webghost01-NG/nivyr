# Portability Hardening Round Evidence

Run date: 2026-10-01. Host: primary Fedora Linux 44 x86_64; Node 22.23.1 / npm 10.9.8; Docker 29.8.1 / Compose 5.5.1; Rust/Cargo 1.98.0. This is a cached, same-host regression run, not independent-machine validation.

## Local results

- `npm ci`: PASS, 3.6s, 0 vulnerabilities reported.
- `npm test`: PASS, 6 tests across 2 files.
- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run nivyr:up`: PASS on the preserved local runtime; latest READY, NU6.3 active, height 224, `ironwood_spendable` 60,603,285,000 zatoshi. This was not a clean-room funding proof.
- `npm run test:integration`: PASS, 3/3 real lifecycle cases, 56.10s on the final code state. Machine-readable observations: [repeatability.json](../bootstrap/integration/2026-10-01T21-34-33.755Z/repeatability.json). An earlier hardening run also passed 3/3 in 54.30s.
- `npm run nivyr:down`: PASS; Nivyr Compose project stopped and local volumes/wallet retained.
- Integration-runner failure probes: absent runtime produced the explicit “run `npm run nivyr:up` successfully first” diagnostic; stopped managed services produced a Zebra-not-responding diagnostic before Vitest.
- Wallet output parser tests: malformed wallet identity/send output fail with explicit non-echoing errors; missing required payment details yield unavailable data. Child process timeout test passes.

## Not experimentally resolved here

- Cargo crates.io acquisition did not run because the pinned `zcash-devtool` binary and source/build cache were already present. The Ubuntu 30s timeout is user-reported. The new sparse-index, `CARGO_HTTP_TIMEOUT=120`, `CARGO_NET_RETRY=6` policy and resume behavior need PC #2 retry evidence.
- Exact Node 22.14.0 was not executed on this host; a download attempt from nodejs.org was reset. The new minimum is supported by the locked Vitest engine range and Node 22.14's documented type stripping support, but PC #3 must rerun.
- Interrupted Cargo build, interrupted archive extraction and partial Docker image acquisition were not failure-injected. The source/Cargo preservation and atomic source extraction behavior were code-reviewed, not fault-injection verified.
- No changes to the historical bootstrap/lifecycle evidence were made. This run is stored separately.
