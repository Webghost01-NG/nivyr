# Historical Nivyr Productization Migration Plan

> This is a dated baseline and migration checklist captured on 2026-10-03 before the v0.1.0 package release. Its baseline findings describe the repository at that time, not the current product state. The package and runtime work was completed; see the current [release record](release-v0.1.0.md), [support matrix](support-matrix.md), and [submission-readiness report](colosseum-readiness-2026-10-09.md).

## Baseline findings (2026-10-03)

- Current branch was `spike/zcash-lifecycle`; package metadata was private `nivyr@0.0.0` with only a library export and repository npm scripts.
- `scripts/nivyr.ts` resolves source checkout root, `.cache`, and fetched Z3 source. It clones Z3 and zcash-devtool, builds zcash-devtool with Cargo, generates Compose from Z3's source tree, and persists wallet/runtime data under the repository.
- `config/regtest-activation-heights.toml` is referenced by library and bootstrap; it must ship with the package or be generated in managed runtime.
- `scripts/run-integration.ts` expects repository Vitest config, integration source, example merchant, and evidence output paths. `tests/integration/lifecycle.integration.ts` starts that merchant by source path.
- Library export is `createNivyr` and `Nivyr`; `NivyrOptions` currently requires explicit binary, wallet root, and activation file. Wallet commands execute through `run()` using `devtoolPath`.
- Docker Compose ownership is project-name based; `down` stops the named project and preserves volumes. Existing owner/state markers are tied to the bootstrap runtime.
- Merchant is an in-memory HTTP reference app. Existing real lifecycle evidence and host reports live in `docs/evidence` and `docs/support-matrix.md`.
- The lockfile pins Vitest 5.0.3, whose metadata and package engine range permit Node `^22.12.0 || ^24.0.0 || >=26.0.0`; repository gate already reflects this. Old macOS report predates/failed before bootstrap and remains a distinct historical result.
- No GitHub workflow or currently verified distributable devtool image exists in the inspected checkout. An untracked `nivyr-0.0.0.tgz` was present and will not be included.

## Migration sequence

1. Add a package entry layout with compiled CLI, public library exports, and an explicit npm `files` allowlist; pack and install outside the checkout before considering removal of `private`.
2. Move runtime configuration out of package/source-relative assumptions. Use a project-local `.nivyr` directory with ownership marker and restrictive permissions; avoid overwriting non-owned paths.
3. Add actionable `doctor` and invoke the same preflight before any bootstrap mutation or network/image activity. Report OS/architecture, supported Node, Docker CLI/daemon/Compose, ports, disk, cache writeability, and registry access separately.
4. Make pinned container devtool image the normal backend and retain pinned source build as maintainer-only opt-in. Package or generate minimal Compose/config assets; keep Z3 commit and all container images pinned and record immutable image digest when available.
5. Isolate wallet command execution behind a small backend interface without changing lifecycle observation semantics.
6. Add app adapter types and preserve the current merchant HTTP interaction. Add forged-txid regression and a second application-pattern reuse proof only when supported by the concrete app API.
7. Add evidence schemas/artifacts for package acceptance, cold starts, reliability, host outcomes, adapter/security scenario, Zallet/view-only/reorg evaluations, validation, and Colosseum criteria. Never promote pending reports to verified.
8. Rewrite README around the developer install path; leave publication gated on a clean external tarball run, verified image distribution, real integration, security audit, and available npm auth.

## Constraints and gates

- No mainnet funds, wallet secrets in artifacts, broad Docker cleanup, or automatic npm publication.
- Keep the current lifecycle as scenario 1. Distinguish chain/indexer/wallet/application states.
- Normal mode must not need Git, Rust, Cargo, curl, tar, OpenSSL, or the Nivyr checkout.
- Current host can prove package shape and `doctor`; it cannot prove macOS/Ubuntu/secondary Fedora success without fresh host runs.
- Publishing is out of scope until all user-specified acceptance gates pass; this branch is not merged.
