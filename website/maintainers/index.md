# Maintainer guide

This page covers development and release work in the Nivyr source repository. It is separate from the ordinary npm user path.

## Local development

```sh
npm ci
npm run typecheck
npm test
npm run build
```

The commands above check the Nivyr library and CLI package. `npm run test:integration` is the source-checkout integration path; ordinary package consumers should use `npx nivyr up`, their test runner, and `npx nivyr down`.

## Validate the package artifact

```sh
npm pack --dry-run
npm pack
```

Install the resulting `.tgz` into a new project outside the repository. Verify the CLI, import, runtime startup, lifecycle suite, and shutdown. Inspect the archive for only allowlisted files; never include `.nivyr/`, `.cache/`, wallet state, identity files, `.env`, `node_modules`, or local evidence logs.

## Maintain the wallet image

The Docker build context is `docker/zcash-devtool/`. It builds the exact zcash-devtool source commit with locked Cargo dependencies and `regtest_support`. The image workflow publishes only on explicit `devtool-v*` tags or manual dispatch; ordinary application/docs pushes do not retag it.

The package pins an immutable digest, not the mutable `0.1.0` image tag. Update a runtime digest only after verifying provenance, required wallet commands, and a full external package lifecycle. Build provenance evidence is in `docs/evidence/devtool-image.json`.

## Release checklist

1. Keep `main` canonical; make reviewed changes through pull requests.
2. Run the package tests, build, and `npm pack --dry-run` on `main`.
3. Install the exact package artifact outside the repository and run `doctor → up → test → down` plus an import/API check.
4. Audit the artifact contents and checksum; publish only that accepted artifact.
5. Verify npm registry metadata and install from a fresh project using the public registry.
6. Record sanitized evidence, create the annotated Git tag on the final `main` commit, and create the GitHub release.

Do not expose OTP values, npm tokens, wallet identities, private keys, or runtime files during a release.
