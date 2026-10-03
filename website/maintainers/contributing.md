# Contributing

Contributions should improve reproducibility, application-level lifecycle coverage, package safety, or developer experience without replacing existing Zcash infrastructure.

## Before changing code

- Read the root `README.md`, `NEXT.md`, architecture, limitations, support matrix, and relevant evidence.
- Check `git status --short --branch` and work on a focused feature branch based on `main`.
- Preserve historical host results and failed attempts; add new evidence rather than rewriting old reports.

## Validate changes

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

For runtime changes, test the packed artifact from a separate consumer project and use local regtest only. Do not use real funds. Never commit wallet state, keys, identities, `.env` files, caches, or npm credentials.

## Documentation

The public site source lives in `website/`. From that directory:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Keep commands aligned with package v0.1.0 and cite repository evidence for verified platform or behavior claims. Reference fixtures must not be described as independent third-party integrations.
