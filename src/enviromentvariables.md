## Environment variables

- `GOMAXPROCS`: For `bun bun`, this sets the maximum number of threads to use. If you’re experiencing an issue with `bun bun`, try setting `GOMAXPROCS=1` to force bun to run single-threaded
- `DISABLE_BUN_ANALYTICS=1` this disables bun’s analytics. bun records bundle timings (so we can answer with data, "is bun getting faster?") and feature usage (e.g., "are people actually using macros?"). The request body size is about 60 bytes, so it’s not a lot of data
- `TMPDIR`: Before `bun bun` completes, it stores the new `.bun` in `$TMPDIR`. If unset, `TMPDIR` defaults to the platform-specific temporary directory (on Linux, `/tmp` and on macOS `/private/tmp`)

## Credits

- While written in Zig instead of Go, bun’s JS transpiler, CSS lexer, and node module resolver source code is based on [@evanw](https://github.com/evanw)’s [esbuild](https://github.com/evanw/esbuild) project. Evan did a fantastic job with esbuild.
- The idea for the name "bun" came from [@kipply](https://github.com/kipply)

