# Nivyr

Nivyr is an engineering spike for a thin TypeScript layer that controls and observes real shielded Zcash payment lifecycles in local application tests.

The project is intentionally evidence first. Its current task is to determine whether reusable lifecycle controls remain after combining a modern Zcash regtest stack with Vitest. It does not implement consensus, indexing, wallet cryptography, or a test runner.

See [the competitive falsification report](docs/landscape.md) and [the environment record](docs/spike/environment.md).

## Status

The runtime experiment is in progress. No public API or Ironwood compatibility claim is stable until the evidence files and spike report say otherwise.

