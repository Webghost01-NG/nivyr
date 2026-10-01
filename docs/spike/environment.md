# Spike Environment

Recorded: 2026-10-01 (Africa/Lagos)

## Host

| Component | Pinned value |
|---|---|
| OS | Fedora Linux 44 Workstation Edition |
| Kernel | Linux 7.2.7-200.fc44.x86_64 |
| Architecture | x86_64 |
| CPUs | 4 |
| RAM | 7.6 GiB (Docker reports 8,187,678,720 bytes) |
| Docker Engine | 29.8.1, build 4a63305 |
| Docker Compose | v5.5.1 |
| Node.js | v22.23.1 |
| npm | 10.9.8 |
| pnpm | unavailable |
| Rust | rustc 1.98.0 |
| Cargo | 1.98.0 |
| TypeScript | 7.0.2 |
| Vitest | 5.0.3 |

## Candidate backends

### ZecKit

- Repository: <https://github.com/intelliDean/ZecKit>
- Commit: `e68d860ddb860e8f9f31daa3a965bfbcf31639e4`
- Commit date: 2026-06-02
- Release version in source: 1.2.0
- ZingoLib build tag: `zingolib_v3.0.1`
- Documented upgrades: NU6 and NU6.1
- Transaction path: Orchard to Orchard
- NU6.3/Ironwood: not represented in activation configuration or wallet balance/send implementation
- Reproducibility concern: Zebra builds from `main`, lightwalletd clones its default branch, and Zaino builds a named fork branch without commit digests.

### Z3

- Repository: <https://github.com/ZcashFoundation/z3>
- Commit: `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`
- Commit date: 2026-08-10
- Zebra image: `zfnd/zebra:6.2.3`
- Zaino image: `zingodevops/zainod:0.6.0-no-tls`
- Zallet image: `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d`
- Regtest upgrade schedule: NU5, NU6, NU6.1, NU6.2, and NU6.3 at height 2
- Selected substrate: pending runtime validation

### Wallet candidate

- Repository: <https://github.com/zcash/zcash-devtool>
- Commit: `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`
- Commit date: 2026-08-28
- librustzcash wallet crates include explicit Ironwood balances, outputs, and regtest activation heights.
- The current `shield` command selects Ironwood after NU6.3.
- Runtime status: pending.

## Second machine

**Status: UNVERIFIED**

Owner:

OS:

RAM:

Architecture:

Docker:

Docker Compose:

Cold start:

Wallet sync:

Result: UNVERIFIED

