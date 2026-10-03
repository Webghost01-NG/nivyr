# Nivyr v0.1.0

Nivyr is integration-testing infrastructure for Zcash payment applications. It lets a TypeScript test exercise the distinct observations between a transaction broadcast and application settlement.

## Included

- The `@webghost01/nivyr` npm package, TypeScript lifecycle API, and `nivyr doctor`, `up`, `test`, and `down` commands.
- A package-owned project runtime using digest-pinned Zcash infrastructure, with no Rust/Cargo compile in normal image mode.
- Real Ironwood-era payment lifecycle coverage and a forged-txid reference regression.
- Reusable scenario execution for memo-based and per-invoice-destination reference application patterns.

## Verified environment

Fedora Linux 44 x86_64 passed external tarball install, doctor, startup, lifecycle/security tests, API import, and scoped shutdown. Twenty final-package reliability runs passed on that host. The test used the linux/amd64 wallet image pinned to [`sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9`](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/devtool-image.json).

## Install

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

## Limitations

Only Fedora Linux 44 x86_64 is verified end to end. Ubuntu, macOS, ARM64, Apple Silicon, Windows, WSL, cold-image startup, view-only merchant wallets, reorg handling, and independent third-party application integrations are unverified. The two app patterns are fixtures, not production integrations.
