# Known limitations

Nivyr v0.1.0 is an early developer tool. These limits describe the evidence available, not a general claim about Zcash applications.

- End-to-end package verification is limited to Fedora Linux 44 x86_64.
- The packaged wallet image is linux/amd64. ARM64, Apple Silicon, Windows, and WSL are unverified.
- Only external tarball installation has been tested so far in committed evidence; public npm install evidence must be recorded after publication.
- A cold image pull and full cold-start timing have not been measured.
- The two application adapter examples are reference fixtures, not independent third-party applications.
- View-only merchant wallets and chain reorganization scenarios are not verified.
- Nivyr does not use Zallet as its verified wallet backend; no live Zallet RPC migration test is claimed.
- Some wallet amount, pool, memo, and scan-progress parsing depends on human-readable output from the pinned zcash-devtool version.
- Nivyr’s `test` command verifies Nivyr’s packaged suite. A stable extension interface for running arbitrary external scenarios through that command is not established; use Nivyr’s TypeScript API from your own test runner.
- No external developer validation or product traction is claimed.
