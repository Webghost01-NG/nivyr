# Nivyr v0.1.0

Nivyr is integration-testing infrastructure for Zcash payment applications. It helps TypeScript teams reproduce payment states that happen after broadcast and mining, including indexer visibility, wallet sync, transaction detection, enhancement, and memo availability.

## What's included

- The `@webghost01/nivyr` package with a TypeScript API and `nivyr doctor`, `up`, `test`, and `down` commands.
- A digest-pinned Zcash wallet container and package-owned, project-scoped regtest runtime. Normal image mode does not compile Rust or Cargo projects.
- A real Ironwood payment lifecycle and a reference regression showing why a mined customer-supplied txid alone is not proof that an invoice received the expected payment.
- Reusable scenario coverage for memo-based and per-invoice-destination reference applications.

## Verified environment

External npm-tarball installation, startup, lifecycle/security tests, library import, and scoped shutdown passed on Fedora Linux 44 x86_64 with Docker. Twenty final-package lifecycle/security runs passed on that host (122.421s minimum, 131.516s median, 143.010s p95, 152.526s maximum). The wallet runtime is pinned to `ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9` (`linux/amd64`).

## Install

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

## Known limitations

Only Fedora Linux 44 x86_64 is verified end to end. Ubuntu, macOS, ARM64, Apple Silicon, Windows/WSL, and other hosts are not verified. The two application patterns are reference fixtures, not independent third-party integrations. Clean-image cold-start timing, view-only merchant behavior, reorg handling, and external developer validation remain unverified.
