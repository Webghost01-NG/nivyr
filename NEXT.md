# Nivyr Handoff — v0.1.0

The canonical product is on `main`, tagged `v0.1.0`, and published as [`@webghost01/nivyr`](https://www.npmjs.com/package/@webghost01/nivyr). The production developer docs are at <https://nivyr-docs.vercel.app>.

## Public user flow

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

Normal package mode uses a digest-pinned `linux/amd64` wallet image. It does not require a Nivyr clone, Rust, or Cargo. Runtime state is consumer-project-owned under `.nivyr/`; `down` stops only Nivyr's project resources and preserves volumes/wallet data.

## Evidence status

- Reproducible public-registry package acceptance is recorded on Fedora Linux 44 x86_64, including CLI, API import, lifecycle, forged-txid regression, and shutdown.
- The packaged warm-image reliability run passed 20/20 on that Fedora host.
- The owner reports successful Ubuntu and macOS tests on 2026-10-09. No OS versions, architectures, Node/Docker/Compose versions, command-by-command results, or logs are retained; those results remain owner-reported and unverified.
- Cold image pull timing, independent app integrations, view-only wallet behavior, and reorg handling are not verified.

See [support matrix](docs/support-matrix.md), [public npm evidence](docs/evidence/public-npm-release.json), and [Colosseum readiness](docs/colosseum-readiness-2026-10-09.md).

## Maintainer checks

```sh
npm ci
npm run typecheck
npm test
npm run build
npm pack --dry-run
npm run build --prefix website
```

For runtime-affecting changes, use the external package acceptance workflow and retain sanitized evidence. Do not republish or move `v0.1.0`; any artifact correction requires a reviewed patch release.

The historical source-build experiment and implementation details are preserved in [bootstrap plan](docs/bootstrap-plan.md) and [spike report](docs/spike/spike-report.md). Those notes do not describe the normal published-package path.

## Colosseum owner actions

- Record/upload the 2–3 minute presentation and up-to-3-minute product demo; add actual URLs to the submission.
- Provide sanitized Ubuntu/macOS run details if those results should support compatibility claims.
- Enter accurate founder/team background, location, development history, and any real demand evidence in the portal.
- Keep market sizing and traction claims evidence-based; none is currently recorded.
