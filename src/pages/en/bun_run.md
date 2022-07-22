---
title: Bun:run
layout: ../../layouts/MainLayout.astro
---

`bun run` automatically loads environment variables from `.env` into the shell/task. `.env` files are loaded with the same priority as the rest of bun, so that means:

1. `.env.local` is first
2. if (`$NODE_ENV` === `"production"`) `.env.production` else `.env.development`
3. `.env`

If something is unexpected there, you can run `bun run env` to get a list of environment variables.

The default shell it uses is `bash`, but if that’s not found, it tries `sh` and if still not found, it tries `zsh`. This is not configurable right now, but if you care file an issue.

`bun run` automatically adds any parent `node_modules/.bin` to `$PATH` and if no scripts match, it will load that binary instead. That means you can run executables from packages too.

```bash
# If you use Relay
bun run relay-compiler

# You can also do this, but:
# - It will only lookup packages in `node_modules/.bin` instead of `$PATH`
# - It will start bun’s dev server if the script name doesn’t exist (`bun` starts the dev server by default)
bun relay-compiler
```

To pass additional flags through to the task or executable, there are two ways:

```bash
# Explicit: include "--" and anything after will be added. This is the recommended way because it is more reliable.
bun run relay-compiler -- -–help

# Implicit: if you do not include "--", anything *after* the script name will be passed through
# bun flags are parsed first, which means e.g. `bun run relay-compiler --help` will print bun’s help instead of relay-compiler’s help.
bun run relay-compiler --schema foo.graphql
```

`bun run` supports lifecycle hooks like `post${task}` and `pre{task}`. If they exist, they will run matching the behavior of npm clients. If the `pre${task}` fails, the next task will not be run. There is currently no flag to skip these lifecycle tasks if they exist, if you want that file an issue.
