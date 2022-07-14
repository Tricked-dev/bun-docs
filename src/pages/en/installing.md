---
title: Installing
layout: ../../layouts/MainLayout.astro
---

Native: (macOS x64 & Silicon, Linux x64, Windows Subsystem for Linux)

```sh
curl -fsSL https://bun.sh/install | bash
```

Docker: (Linux x64)

```sh
docker pull jarredsumner/bun:edge
docker run --rm --init --ulimit memlock=-1:-1 jarredsumner/bun:edge
```

If using Linux, kernel version 5.6 or higher is strongly recommended, but the minimum is 5.1.
