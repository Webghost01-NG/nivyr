# External Package Test

Nivyr 0.1.0 is not published to npm yet. External tarball acceptance passed on Fedora Linux 44 x86_64. A maintainer can share `webghost01-nivyr-0.1.0.tgz`; test it from a new Node project without cloning the Nivyr repository. Public publication is waiting for npm's required two-factor authorization.

Requirements: Node.js `^22.12.0 || ^24 || >=26`, npm, Docker Engine/Desktop with Compose v2, registry access, and preferably 8 GiB free disk. The current wallet image supports linux/amd64; Apple Silicon has not been validated.

```sh
mkdir nivyr-smoke-test
cd nivyr-smoke-test
npm init -y
npm install --save-dev /absolute/path/to/webghost01-nivyr-0.1.0.tgz
npx nivyr doctor
npx nivyr up
npx nivyr test
npx nivyr down
```

The package writes wallet and chain state under this project's `.nivyr/` directory. `down` stops the Nivyr-owned containers and preserves those volumes and wallet data. Do not send `.nivyr/`, wallet files, identity files, or seed phrases when reporting results.

Please report the OS/architecture, Node/npm, Docker/Compose versions, each command's pass/fail result, and any sanitized error text. Do not include usernames, absolute home paths, wallet addresses, identities, or secrets.
