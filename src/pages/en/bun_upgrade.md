---
title: Bun:upgrade
layout: ../../layouts/MainLayout.astro
---

To upgrade bun, run `bun upgrade`.

It automatically downloads the latest version of bun and overwrites the currently-running version.

This works by checking the latest version of bun in [bun-releases-for-updater](https://github.com/Jarred-Sumner/bun-releases-for-updater/releases) and unzipping it using the system-provided `unzip` library (so that Gatekeeper works on macOS)

If for any reason you run into issues, you can also use the curl install script:

```bash
curl https://bun.sh/install | bash
```

It will still work when bun is already installed.

bun is distributed as a single binary file, so you can also do this manually:

- Download the latest version of bun for your platform in [bun-releases-for-updater](https://github.com/Jarred-Sumner/bun-releases-for-updater/releases/latest) (`darwin` == macOS)
- Unzip the folder
- Move the `bun` binary to `~/.bun/bin` (or anywhere)
