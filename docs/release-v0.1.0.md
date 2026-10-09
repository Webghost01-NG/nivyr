# Nivyr v0.1.0 Release Record

Release commit: the final main commit targeted by annotated Git tag `v0.1.0` (recorded in the tag and final release report).

Tag: `v0.1.0` (annotated tag; pushed after final public-registry evidence was committed).

npm package: [`@webghost01/nivyr@0.1.0`](https://www.npmjs.com/package/@webghost01/nivyr), public; `latest` points to `0.1.0`.

GHCR image used by the package: `ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9`, built from zcash-devtool commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8` for `linux/amd64`. This is the digest used by the external lifecycle acceptance; it remains pullable by digest.

The mutable GHCR tag `0.1.0` was observed at `sha256:4896a6d4553f13fbc614172749e8248b97c6b177f482cd833dde8b519d7a9097` after a trusted `main` image workflow run. Its provenance was verified. Nivyr remains pinned to the independently lifecycle-tested `42d7…` digest. The workflow is being restricted to explicit `devtool-v*` tags or manual dispatch so normal product/release commits do not move the mutable wallet image tag.

Verified host: Fedora Linux 44 x86_64, Node.js 22.23.1, Docker 29.8.1, Compose 5.5.1.

## Acceptance status

- Package install: **PASS** from both the exact npm tarball and the public registry in fresh external Node projects with no Nivyr checkout. Public registry details are in [public npm evidence](evidence/public-npm-release.json).
- Doctor: **PASS_WITH_LOW_DISK_ADVISORY** on the public registry run (3.6 GiB free; 8 GiB recommended).
- Up: **PASS**; pinned Zebra and Zaino started, NU6.3 was active, and the sender reached 624.99480000 spendable local regtest ZEC before READY.
- Test: **PASS**; real lifecycle, forged-txid regression, and both reference application patterns passed after fresh public-package bootstrap.
- Down: **PASS**; stopped the Nivyr-owned project and preserved its wallet and volumes.
- Library import: **PASS**; public-package runtime import and a TypeScript declaration/API check passed.
- Exact final tarball regression: **PASS**; artifact SHA-512 and failed-first-attempt history are recorded in [final release regression evidence](evidence/final-release-regression.json).
- Forged txid: **PASS** for the reference merchant fixture; mined-only settlement was reproduced and corrected wallet-observed settlement passed.
- Adapter reuse: **PASS** across memo-based and per-invoice-destination reference API patterns; independent third-party applications are not claimed.
- Post-fix reliability loop: **PASS**; 20/20 on the exact final tarball, 122.421s minimum / 131.516s median / 143.010s p95 / 152.526s maximum. See [machine-readable results](evidence/reliability.json).
- Rust/Cargo: **NOT REQUIRED** in normal image mode; wallet operations ran in the digest-pinned container.

## Known limitations

Only Fedora Linux 44 x86_64 has reproducible end-to-end evidence. On 2026-10-09, the project owner reported successful Nivyr testing on Ubuntu and macOS; exact host versions, architectures, commands, outcomes, and logs were not retained, so these remain owner-reported rather than verified compatibility claims. Secondary Fedora, ARM64, Apple Silicon, Windows/WSL, cold-image timing, independent third-party applications, developer validation, view-only merchant wallets, and reorg handling are not verified. Zallet was reviewed from release documentation and image metadata; no live RPC migration test was performed.
