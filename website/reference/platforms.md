# Supported platforms

Compatibility statements reflect completed end-to-end evidence. A green unit test on one host does not establish compatibility on another.

## Verified

| Host | Result | Evidence |
| --- | --- | --- |
| Fedora Linux 44 x86_64 | **Verified**: external tarball and public npm registry installation, doctor, image-mode startup, real lifecycle/security tests, library import, and scoped shutdown. | [Primary Fedora record](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/hosts/fedora-primary/result.json), [public npm run](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/public-npm-release.json) |

The final packaged reliability campaign ran 20/20 successfully on this host. The image was already cached for that campaign.

## Pending or unverified

| Host | Current evidence |
| --- | --- |
| Ubuntu | The owner reports successful Nivyr testing on 2026-10-09. Exact OS release, architecture, Node/Docker/Compose versions, commands, per-command outcomes, and logs are not retained; report is not reproducibly verified. The historical Cargo source-build timeout remains recorded separately. See the [owner report](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/hosts/ubuntu/owner-report-20261009.json). |
| macOS | The owner reports successful Nivyr testing on 2026-10-09. Exact macOS version, architecture, Node/Docker/Compose versions, commands, per-command outcomes, and logs are not retained; report is not reproducibly verified. The earlier Node-gate failure remains recorded separately. See the [owner report](https://github.com/Webghost01-NG/nivyr/blob/main/docs/evidence/hosts/macos/owner-report-20261009.json). |
| Secondary Fedora machine | A previous report found the Docker CLI absent. No package-mode retest is recorded. |
| ARM64 / Apple Silicon | Wallet image is linux/amd64. Native ARM64 support is not available or verified; intentional emulation is not claimed. |
| Windows / WSL | Not tested. |
| Other Linux/macOS releases and CI runners | Not tested. |

See the [complete support matrix](https://github.com/Webghost01-NG/nivyr/blob/main/docs/support-matrix.md) for the historical distinction between host failures.
