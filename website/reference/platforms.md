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
| Ubuntu | Historical source-build attempt failed during a crates.io request timeout. No packaged-path rerun is recorded. |
| macOS | Historical run stopped at the earlier Node-version gate before runtime startup. Package-mode behavior is not verified. |
| Secondary Fedora machine | A previous report found the Docker CLI absent. No package-mode retest is recorded. |
| ARM64 / Apple Silicon | Wallet image is linux/amd64. Native ARM64 support is not available or verified; intentional emulation is not claimed. |
| Windows / WSL | Not tested. |
| Other Linux/macOS releases and CI runners | Not tested. |

See the [complete support matrix](https://github.com/Webghost01-NG/nivyr/blob/main/docs/support-matrix.md) for the historical distinction between host failures.
