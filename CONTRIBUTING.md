# Contributing to Nivyr

Thanks for helping improve Nivyr. Contributions should strengthen reproducibility, Zcash payment lifecycle testing, package safety, or developer experience while building on existing Zcash infrastructure.

## Before you start

- Read the root `README.md`, `NEXT.md`, `docs/architecture.md`, `docs/limitations.md`, `docs/support-matrix.md`, and relevant files in `docs/evidence/`.
- Check `git status --short --branch` and make a focused branch from the current `main`.
- For larger changes, open an issue or discussion first so scope and acceptance criteria are clear.
- Preserve historical evidence, including failed attempts. Add new results with their date, host, versions, commands, and limitations rather than rewriting old reports.

## Development checks

Use the Node version supported by `package.json`, then run from the repository root:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

For package/runtime changes, also install the packed artifact in a fresh project outside this checkout and verify its documented CLI, API, and lifecycle path. Run real payment tests only on the disposable local regtest environment; never use real funds.

## Security and evidence

- Never commit wallet state, seeds, private keys, identities, `.env` files, credentials, npm tokens, or local runtime/cache data.
- Sanitize logs and evidence; preserve failures and state whether a result is maintainer-run, independently reproduced, or owner-reported.
- Do not describe local reference fixtures as third-party integrations or fixture failures as vulnerabilities in an external application.
- Keep Docker/Compose cleanup scoped to Nivyr-owned resources.

## Documentation

The public documentation source is in `website/`. To check it:

```sh
cd website
npm ci
npm run build
```

Keep user commands aligned with the released package. Tie compatibility and performance claims to retained evidence and state the host, architecture, and image/cache conditions.

## Zcash upstream contributions

Nivyr does not replace Zebra, Zaino, Z3, wallet software, or other Zcash infrastructure. If a change is proposed for an upstream Zcash repository, first read that repository's own contribution instructions and coordinate with its maintainers. Follow the applicable [librustzcash contribution and style guidance](https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md#styleguides) as a primary reference where relevant, including its [branch history](https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md#branch-history), [pull request review](https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md#pull-request-review), and [commit message](https://github.com/zcash/librustzcash/blob/main/CONTRIBUTING.md#commit-messages) guidance. Do not assume an upstream change is accepted until that project's review and merge process is complete.

## Pull requests

Use a clear, focused commit message and describe:

- the problem and intended behavior;
- implementation/documentation changes;
- checks run and their results;
- evidence or platform limitations;
- risks, dependencies, and any upstream coordination needed.

Do not publish npm packages, move release tags, or publish runtime images as part of an ordinary pull request. Release actions require the project's explicit release process and authorization.
