# Runtime and Docker

Normal package mode runs a Nivyr-owned local regtest from your consumer project. Nivyr generates a Compose file and state under `.nivyr/`, then starts pinned infrastructure. The project folder remains separate from `node_modules`.

## Pinned components

| Component | Pin | Role |
| --- | --- | --- |
| Zebra | `6.2.3` plus image digest | Regtest chain and RPC. |
| Zaino | `0.10.1-no-tls` plus image digest | Block indexing and wallet sync service. |
| zcash-devtool | source commit `5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8`; container digest below | Wallet creation, send, sync, transaction inspection, and enhancement. |
| NU6.3 | activation height `2` | Ironwood-era regtest activation. |

The package uses:

```text
ghcr.io/webghost01-ng/nivyr-zcash-devtool@sha256:42d7cd27f6c133543f90bfa6558598c2bc4a0da42a3ff17f1ad1476f2246edb9
```

This is the linux/amd64 image digest used by the verified external package lifecycle. The package pins the immutable digest rather than resolving the mutable image tag at startup.

## No local Rust build in image mode

Normal npm users need Node.js, npm, Docker, Compose, and image-registry access on first pull. Nivyr invokes wallet commands in the pinned container, so normal mode does not run `rustc`, Cargo, or compile a crates.io dependency tree.

Maintainers can select a local wallet executable using `NIVYR_DEVTOOL_MODE=source` or `devtoolPath`, but this path requires the matching zcash-devtool binary and is not the normal package path. Building that binary from source requires Rust/Cargo and network access to crates.io.

## Runtime scope and persistence

- Runtime files and wallet identities are stored under the consumer project’s `.nivyr/` directory.
- Nivyr writes an ownership marker and a project-scoped Compose name.
- Published ports bind to loopback, not every host interface.
- `npx nivyr down` stops only this Nivyr Compose project and preserves its volumes and wallet for reuse.
- Nivyr does not kill unrelated processes, containers, or volumes.

The verified full package flow covers Fedora Linux 44 x86_64 only. The wallet container is linux/amd64; Apple Silicon emulation is not claimed.
