# Troubleshooting

Start with:

```sh
npx nivyr doctor
```

Doctor runs before `up` pulls images or starts Zcash services. Fix required failures, then run it again.

## Docker CLI missing

Doctor reports that Docker was not found in `PATH`. Install Docker and verify:

```sh
docker --version
docker compose version
docker info
```

This replaces an unhelpful low-level process-spawn error with an actionable diagnostic.

## Docker daemon unavailable

The CLI may be installed while Docker Engine/Desktop is stopped or inaccessible to the current user. Start the daemon and check `docker info` before retrying.

## Compose unavailable or too old

Nivyr requires Docker Compose v2.24.4 or newer. Check `docker compose version`; the standalone legacy `docker-compose` executable is not the documented prerequisite.

## Ports occupied

The packaged runtime uses loopback ports `49232` (Zebra RPC), `49080` (Zebra health), `49137` (Zaino gRPC), and `49237` (Zaino JSON-RPC). Doctor reports the busy port and `up` stops before startup. Stop or reconfigure the process that owns the port; Nivyr does not kill it.

## Low disk space

Doctor recommends 8 GiB available across the project and Docker storage. This is an advisory rather than a hard threshold. Free space before a large image pull if Docker reports a storage error.

## Registry or image pull unavailable

First pulls require Docker Hub and GHCR access. Doctor checks registry endpoints, but endpoint reachability does not guarantee that every image layer can be downloaded. Check registry access with Docker and retry `npx nivyr up` when the network is available.

## Unsupported architecture

The pinned wallet image currently targets linux/amd64. ARM64 and Apple Silicon are not verified as native hosts, and Nivyr does not claim intentional emulation. Check [platform support](/reference/platforms).

## Node version mismatch

Use Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`, as declared in the package engines metadata. Check `node --version` and select a supported release.

## Runtime readiness or integration failure

If `up` fails, retain `.nivyr/` for diagnosis; do not delete wallet or chain state while Docker resources are active. Review the terminal error and rerun `npx nivyr doctor`. A test requires a ready runtime; it does not implicitly start one. To stop only the project’s Nivyr stack after an interrupted run, use `npx nivyr down`.

If you report an issue, include the host OS/architecture, Node/npm, Docker/Compose versions, doctor output, command stage, and sanitized error text. Never attach `.nivyr/`, wallet files, identity files, or secrets.
