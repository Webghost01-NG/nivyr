# Host Support Matrix

Status describes evidence that exists; it is not a compatibility promise. Independent reports are user-supplied and have not been rerun by the maintainer.

| Machine/run | OS / architecture | Node / npm | Docker / Compose | Rust / Cargo | State and result | Elapsed time / failure |
|---|---|---|---|---|---|---|
| Primary development host | Fedora Linux 44, x86_64 | 22.23.1 / 10.9.8 | 29.8.1 / 5.5.1 | 1.98.0 / 1.98.0 | **LOCALLY VERIFIED**: clean-room bootstrap, cached repeat, and three Ironwood lifecycle repetitions passed. Hardening round also passed cached READY + 3/3 lifecycle after code changes. | Wallet source build about 24 minutes. Cached bootstrap 196s; latest preserved-state up ~5s; latest integration 56.10s. Recorded 2026-10-01. |
| PC #2, user report | Ubuntu; architecture and exact OS release not recorded | not recorded | not recorded | not recorded | **BLOCKED**: `npm ci` and source acquisition succeeded; pinned wallet build failed during crates.io request for `minicbor`. The reported curl timeout was 30s with 0 bytes. Bootstrap did not reach READY; the subsequent integration error was downstream. | Cold build elapsed time not supplied. Retry on the same preserved state is pending. |
| PC #3, user report | macOS; version and architecture not recorded | 22.14.0 / 10.9.2 | not recorded | not recorded | **BLOCKED**: bootstrap stopped at the Nivyr Node gate before infrastructure work. `npm ci` completed with EBADENGINE. No macOS runtime behavior has been tested. | Not supplied. Re-test with the documented supported Node range is pending. |
| Productization host, Fedora Linux 44 x86_64 | Fedora 44 / x86_64 | 22.23.1 / 10.9.8 | 29.8.1 / 5.5.1 | Not used; Cargo/rustc trap wrappers recorded no invocation | **VERIFIED**: external tarball install, doctor, import, image-mode `up`, packaged `test` (real lifecycle plus forged-txid red/green), and scoped `down` passed. Low-disk advisory at 3.8 GiB free. | Image was already cached; no cold image-pull timing. Lifecycle scenario 20.365s; test command including security scenario about 37.423s from evidence timestamps. |

## Current runtime requirements

- Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`, matching the pinned Vitest 5 runtime range. Node 22.14 includes `--experimental-strip-types`; this supports lowering the original project-specific 22.23.1 gate. Node 23/25 are excluded because Vitest's declared engine range excludes those lines.
- Docker Engine/daemon and Compose v2.24.4 or newer.
- Verified packaged image mode requires Node/npm and Docker Engine/daemon with Compose; first run also requires registry access for pinned images. The tested wallet image is linux/amd64.
- Maintainer source mode still needs Git, curl, OpenSSL, tar, Rust stable and Cargo for a source build of the pinned wallet.
- First packaged run needs registry access to retrieve pinned images. Previous source checkout needed GitHub, crates.io and pinned image registries.
- Fedora Linux 44 x86_64 is verified end to end using the external npm tarball. Ubuntu and macOS package-mode retests are pending; ARM64, Windows/WSL and CI runners are unverified.

The Node floor is based on the locked Vitest 5.0.3 package engine (`^22.12.0 || ^24.0.0 || >=26.0.0`) plus Nivyr's use of `--experimental-strip-types`, introduced in Node 22.6 according to the [Node.js v22.14 TypeScript docs](https://nodejs.org/download/release/v22.14.0/docs/api/typescript.html). Node 22.14 is therefore inside the declared dependency/runtime range, though this machine could not download that exact Node binary for a separate local execution; the PC #3 rerun remains the required runtime confirmation.

The Cargo policy follows the [Cargo configuration reference](https://doc.rust-lang.org/cargo/reference/config.html): `http.timeout` defaults to 30 seconds and can be overridden with `CARGO_HTTP_TIMEOUT`; registry retry count is configurable through `CARGO_NET_RETRY`. The failure reported by PC #2 was a 30-second no-data timeout for a sparse-index crate path. Nivyr now supplies bounded `120` and `6` defaults, while preserving explicit caller overrides.

## Stack pins and provenance

Z3 `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`; zcash-devtool `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`; Zebra `zfnd/zebra:6.2.3@sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2`; Zaino `zingodevops/zainod:0.10.1-no-tls@sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9`; Zallet `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d`. Pins avoid the Z3 default Zaino 0.6 protocol mismatch observed with Ironwood. Updates should be deliberate: review upstream release/source compatibility, update exact pins together, then rerun fresh funding and repeated lifecycle proofs. No downloaded compiled wallet binary is checked into Git.
