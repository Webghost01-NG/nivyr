# Evidence and verification

The site summarizes committed test artifacts rather than pasting full JSON records. Each link opens the corresponding evidence in the repository.

## Package artifact and runtime

- The allowlisted package acceptance record documents an external npm tarball installation, library import, `doctor`, `up`, lifecycle test, and scoped `down`: [package acceptance](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/package-acceptance.json).
- Final tarball evidence records its SHA-512, exact 25-file package audit, two earlier bootstrap failures, and final successful rerun: [final release regression](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/final-release-regression.json).
- The runtime package uses the digest-pinned linux/amd64 wallet image. The image provenance and the later mutable-tag observation are recorded separately: [devtool image evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/devtool-image.json).
- Stack image and protocol pins are recorded in [stack proof](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/stack-proof.json).

## Lifecycle and security scenario

- The packaged transaction passed through broadcast, mining, indexing, unscanned merchant wallet, sync, detection, enhancement, and memo availability: [packaged lifecycle evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-lifecycle-20261003.json).
- The reference regression reproduced mined-only settlement for an unrelated real mined regtest transaction, then settled only the expected wallet-observed payment: [forged txid evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/packaged-forged-txid.json).
- The same scenario machinery passed for memo-based and per-invoice-destination reference patterns: [adapter reuse evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/adapter-reuse.json).

## Reliability and host scope

- Final packaged campaign: **20 runs, 20 passes, 0 failures**; 122.421s minimum, 131.516s median, 143.010s p95, 152.526s maximum. It ran against the exact final npm tarball on Fedora Linux 44 x86_64 with a warm image cache: [machine-readable reliability results](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/reliability.json).
- The host record is [Fedora primary](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/hosts/fedora-primary/result.json). Other machine reports remain historical or pending as listed in [supported platforms](/reference/platforms).

## Public registry evidence

The public `@webghost01/nivyr@0.1.0` package resolves from npm with `latest` pointing to `0.1.0`. A clean consumer project installed it from the public registry, then passed `doctor`, image-backed `up`, `test`, `down`, runtime import, and a TypeScript declaration check. See [public npm release evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/public-npm-release.json).

The documentation site is deployed on Vercel; its production build and route checks are recorded in [site deployment evidence](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/docs-site-deployment.json).
