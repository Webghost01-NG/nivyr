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
- Zebra image digest: `sha256:bb2a6029db277ee3a10e951dcc0ddd36b4cbcbe0fad684746d695ee21d53fde2`
- Zaino image: `zingodevops/zainod:0.6.0-no-tls`
- Zaino image digest: `sha256:3ed6cbb5ed85d6a610ec5cf80cffb4a14a6f5b2517abad754a296cad95605bb0`
- Zallet image: `zodlinc/zallet:v0.1.0-beta.1@sha256:1849b4469875dc0165942c06d15fa6a7da76b2d43bade578cc8e5903a639869d`
- Regtest upgrade schedule: NU5, NU6, NU6.1, NU6.2, and NU6.3 at height 2
- Selected substrate: Z3 commit `e84ce9fd8e864ff0b2a8a62f6ce14392145db0fb`, with Zebra 6.2.3 and the later Zaino 0.10.1 image override below.
- Runtime: Zebra and Zaino reached height 230 by the end of the final three lifecycle repetitions (payment blocks 228–230); NU6.3 reported active from height 2.
- Z3 defaults to a Zaino 0.6 image that failed explicit wallet synchronization with `Invalid shielded protocol value`. The old gRPC enum had no Ironwood value.
- Supported image override used during the experiment: `zingodevops/zainod:0.10.1-no-tls@sha256:c8428a39d510fd59a9182a5e19cf473d6af6a4b6a672aff8b1a690e9c23c17b9`.
- Zaino source pin used to verify protocol support: `797bc2f4c76b54903ed31a08fa63b5256303105e` (2026-09-29).
- Exact `zainod-0.10.1` release source commit: `3244a74bb09fa6a09a4b2deeb6be53bab0890747` (2026-09-26); its gRPC `ShieldedProtocol` includes Sapling, Orchard, and Ironwood.

### Wallet candidate

- Repository: <https://github.com/zcash/zcash-devtool>
- Commit: `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`
- Commit date: 2026-08-28
- librustzcash wallet crates include explicit Ironwood balances, outputs, and regtest activation heights.
- The current `shield` command selects Ironwood after NU6.3.
- Build: release binary with `regtest_support` enabled, built locally on this host.
- Runtime: successfully initialized/synced regtest wallets through Zaino 0.10.1, shielded coinbase-derived transparent funds into Ironwood, sent v6 Ironwood payments with memos, and recovered received amount/memo.
- Important implementation detail: transaction discovery and decrypted memo are separate operations. `sync` detected the note and amount; `enhance` fetched full transaction data and made plaintext memo visible.

## Runtime evidence

- Transaction `9dde289f2c649c727b3aa69bb13ad70e69d7c8de17e863c94b233027dd9e3691`: version 6, two Ironwood actions, no transparent inputs/outputs, no Sapling spends/outputs, no Orchard actions. It paid 2 ZEC with memo `NIVYR-SPIKE-001`.
- Three additional payments were controlled and observed from TypeScript/Vitest. All three were v6 Ironwood-only, remained unseen by the fresh recipient before explicit sync, appeared after sync at the mined height, and exposed their plaintext memo after wallet enhancement.
- Repeat timings and machine-readable observations are in `docs/evidence/runs/repeatability.json`.

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
