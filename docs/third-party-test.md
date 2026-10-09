# External Package Test

Nivyr `0.1.0` is public on npm. To try the released package in an ordinary Node project, use:

```sh
npm install -D @webghost01/nivyr
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

Requirements: Node.js `^22.12.0 || ^24.0.0 || >=26.0.0`, npm, Docker Engine/Desktop with Docker Compose v2.24.4 or newer, available required ports, registry access, and preferably 8 GiB free disk. The packaged wallet image is `linux/amd64`. Fedora Linux 44 x86_64 has reproducible end-to-end package evidence. The project owner has also reported successful Ubuntu and macOS testing, but no run logs or exact host/runtime details are currently retained; those reports do not establish verified platform support. See the [support matrix](support-matrix.md).

The first `up` starts a package-owned local Zcash regtest and prepares a disposable sender. It does not use mainnet/testnet funds or a faucet. The normal package path uses the digest-pinned wallet image and does not compile Rust locally.

The package writes wallet and chain state under this project's `.nivyr/` directory. `down` stops the Nivyr-owned Compose project and preserves those volumes and wallet data. Do not send `.nivyr/`, wallet files, identity files, or seed phrases when reporting results.

For a useful reproducibility report, include the exact OS release and architecture; Node and npm versions; Docker and Compose versions; whether the image cache was cold or warm; the commands run and each outcome; and sanitized error output. Do not include usernames, absolute home paths, wallet addresses, identity data, or secrets. Send reports to the project maintainer through the repository's issue tracker only after redacting local details.
