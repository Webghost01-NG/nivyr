# CLI reference

The package installs the `nivyr` executable. Invoke it with `npx nivyr <command>` or through a local project binary.

## `nivyr doctor`

Checks operating system and architecture, Node, npm, Docker CLI, Docker daemon, Compose, required ports, runtime-directory write access, free disk, image-registry connectivity, and wallet image architecture.

Required host failures make doctor exit non-zero and stop `up` before runtime state or image pulls. Low disk and registry reachability are reported as advisories; image pull can still fail later if a registry is unavailable. Example:

```text
✓ Docker CLI: Docker version …
✓ Docker daemon: server …
✓ Docker Compose: …
✓ Required ports available: 49232, 49080, 49137, 49237
! Free disk: …; 8 GiB recommended
```

## `nivyr up`

Runs doctor first, then starts the package-owned runtime and prepares a funded local regtest sender. It uses digest-pinned images and stores runtime state under `.nivyr/`. If doctor fails, startup does not proceed.

## `nivyr test`

Runs Nivyr’s packaged real lifecycle and reference forged-txid checks against the ready runtime. It is not a competing general-purpose test runner. Use Vitest or your preferred test framework for your application’s assertions.

## `nivyr down`

Stops only this consumer project’s Nivyr Compose project. It preserves volumes and wallet files to support state reuse.

## Exit behavior

- `0`: the command completed, or doctor found the host ready (advisories may remain).
- Non-zero: a required host check failed, runtime bootstrap failed, the lifecycle/security suite failed, or shutdown returned an error.
- Unknown commands print `Usage: nivyr <doctor|up|test|down>` and exit with status `2`.

## There is no `status` command

Use `doctor` to inspect host readiness. Do not rely on undocumented commands.
