# Security model

Nivyr is test infrastructure for local Zcash regtest. It is not a production wallet, a custody service, or a formal security audit.

## Funds and network

The verified scenarios run on an isolated local regtest with disposable mined rewards. They do not use real mainnet or testnet ZEC and do not depend on a faucet. Do not point Nivyr’s regtest RPC or wallet configuration at a public or production network.

## Local state

Runtime configuration, wallet databases, and identity files live in the consumer project’s `.nivyr/` directory, outside the installed package. Treat those files as private local wallet state. Do not add them to commits, issue reports, or public evidence. The npm package allowlist excludes runtime state, identities, caches, and developer-only assets.

## Docker ownership

Nivyr labels resources through a project-scoped Compose name and records ownership state. `down` targets only that Compose project and intentionally preserves its volumes. It does not clean arbitrary Docker resources.

The runtime exposes only loopback ports. The local stack uses regtest credentials and a plaintext local h2c connection between the wallet container and Zaino; it is not an externally hardened service deployment.

## What the security regression means

The forged-txid guide demonstrates that a mined-only acceptance rule can incorrectly settle an invoice in the included reference merchant fixture. It is not evidence that any third-party application is vulnerable. It also is not a guarantee that Nivyr can identify every incorrect settlement policy.

## Scope of assurance

- Runtime images and source revisions are pinned; the packaged wallet image has recorded provenance.
- The shipped npm artifact is allowlisted and has been inspected for secrets and wallet state.
- The real lifecycle and reference regression pass in the stated verified environment.
- No formal audit of Nivyr, Docker, Zebra, Zaino, zcash-devtool, or the host system is claimed.
