---
title: Using bun.js
layout: ../../layouts/MainLayout.astro
---

bun.js focuses on performance, developer experience and compatibility with the JavaScript ecosystem.

```ts
// http.ts
export default {
  port: 3000,
  fetch(request: Request) {
    return new Response("Hello World");
  },
};

// bun ./http.ts
```

| Requests per second                                                    | OS    | CPU                            | bun version |
| ---------------------------------------------------------------------- | ----- | ------------------------------ | ----------- |
| [260,000](https://twitter.com/jarredsumner/status/1512040623200616449) | macOS | Apple Silicon M1 Max           | 0.0.76      |
| [160,000](https://twitter.com/jarredsumner/status/1511988933587976192) | Linux | AMD Ryzen 5 3600 6-Core 2.2ghz | 0.0.76      |

<details>
<summary>Measured with <a target="_blank" href="https://github.com/uNetworking/uSockets/blob/master/examples/http_load_test.c">http_load_test</a></summary> by running:

```bash
./http_load_test  20 127.0.0.1 3000
```

</details>

bun.js prefers Web API compatibility instead of designing new APIs when possible. bun.js also implements some Node.js APIs.

- TypeScript & JSX support is built-in, powered by Bun's JavaScript transpiler
- ESM & CommonJS modules are supported (internally, bun.js uses ESM)
- Many npm packages "just work" with bun.js (when they use few/no node APIs)
- tsconfig.json `"paths"` is natively supported, along with `"exports"` in package.json
- `fs`, `path`, and `process` from Node are partially implemented
- Web APIs like [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch), [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response), [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) and more are built-in
- [`HTMLRewriter`](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/) makes it easy to transform HTML in bun.js
- Starts [4x faster than Node](https://twitter.com/jarredsumner/status/1499225725492076544) (try it yourself)
- `.env` files automatically load into `process.env` and `Bun.env`
- top level await

The runtime uses JavaScriptCore, the JavaScript engine powering WebKit and Safari. Some web APIs like [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) and [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) directly use [Safari's implementation](https://github.com/oven-sh/bun/blob/HEAD/src/bun.js/bindings/webcore/JSFetchHeaders.cpp).

`cat` clone that runs [2x faster than GNU cat](https://twitter.com/jarredsumner/status/1511707890708586496) for large files on Linux

```js
// cat.js
import { resolve } from "path";
import { write, stdout, file, argv } from "bun";

const path = resolve(argv.at(-1));

await write(
  // stdout is a Blob
  stdout,
  // file(path) returns a Blob - https://developer.mozilla.org/en-US/docs/Web/API/Blob
  file(path)
);

// bun ./cat.js ./path-to-file
```

Server-side render React:

```js
// requires Bun v0.1.0 or later
// react-ssr.tsx
import { renderToReadableStream } from "react-dom/server";

const dt = new Intl.DateTimeFormat();

export default {
  port: 3000,
  async fetch(request: Request) {
    return new Response(
      await renderToReadableStream(
        <html>
          <head>
            <title>Hello World</title>
          </head>
          <body>
            <h1>Hello from React!</h1>
            <p>The date is {dt.format(new Date())}</p>
          </body>
        </html>
      )
    );
  },
};

// bun react-ssr.tsx
```

There are some more examples in the [examples](./examples) folder.

PRs adding more examples are very welcome!

### Types for bun.js (editor autocomplete)

The best docs right now are the TypeScript types in the [`bun-types`](types/bun/bun.d.ts) npm package. A docs site is coming soon.

To get autocomplete for bun.js types in your editor,

1. Install the `bun-types` npm package:

```bash
# yarn/npm/pnpm work too, "bun-types" is an ordinary npm package
bun add bun-types
```

2. Add this to your `tsconfig.json` or `jsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "module": "esnext",
    "target": "esnext",
    // "bun-types" is the important part
    "types": ["bun-types"]
  }
}
```

You can also [view the types here](./types/bun/bun.d.ts).

### Fast paths for Web APIs

bun.js has fast paths for common use cases that make Web APIs live up to the performance demands of servers and CLIs.

`Bun.file(path)` returns a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) that represents a lazily-loaded file.

When you pass a file blob to `Bun.write`, Bun automatically uses a faster system call:

```js
const blob = Bun.file("input.txt");
await Bun.write("output.txt", blob);
```

On Linux, this uses the [`copy_file_range`](https://man7.org/linux/man-pages/man2/copy_file_range.2.html) syscall and on macOS, this becomes `clonefile` (or [`fcopyfile`](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/copyfile.3.html)).

`Bun.write` also supports [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) objects. It automatically converts to a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

```js
// Eventually, this will stream the response to disk but today it buffers
await Bun.write("index.html", await fetch("https://example.com"));
```

## Using bun as a package manager

On Linux, `bun install` tends to install packages 20x - 100x faster than `npm install`. On macOS, it’s more like 4x - 80x.

<img src="https://user-images.githubusercontent.com/709451/147004342-571b6123-17a9-49a2-8bfd-dcfc5204047e.png" height="200" />

To install packages from package.json:

```bash
bun install
```

To add or remove packages from package.json:

```bash
bun remove react
bun add preact
```

<details> 
<summary><strong>For Linux users</strong>: <code>bun install</code> needs Linux Kernel 5.6 or higher to work well</summary>

The minimum Linux Kernel version is 5.1. If you're on Linux kernel 5.1 - 5.5, `bun install` should still work, but HTTP requests will be slow due to a lack of support for io_uring's `connect()` operation.

If you're using Ubuntu 20.04, here's how to install a [newer kernel](https://wiki.ubuntu.com/Kernel/LTSEnablementStack):

```bash
# If this returns a version >= 5.6, you don't need to do anything
uname -r

# Install the official Ubuntu hardware enablement kernel
sudo apt install --install-recommends linux-generic-hwe-20.04
```

</details>

## Using bun as a task runner

Instead of waiting 170ms for your npm client to start for each task, you wait 6ms for bun.

To use bun as a task runner, run `bun run` instead of `npm run`.

```bash
# Instead of "npm run clean"
bun run clean

# This also works
bun clean
```

Assuming a package.json with a `"clean"` command in `"scripts"`:

```json
{
  "name": "myapp",
  "scripts": {
    "clean": "rm -rf dist out node_modules"
  }
}
```

## Environment variables

- `GOMAXPROCS`: For `bun bun`, this sets the maximum number of threads to use. If you’re experiencing an issue with `bun bun`, try setting `GOMAXPROCS=1` to force bun to run single-threaded
- `DISABLE_BUN_ANALYTICS=1` this disables bun’s analytics. bun records bundle timings (so we can answer with data, "is bun getting faster?") and feature usage (e.g., "are people actually using macros?"). The request body size is about 60 bytes, so it’s not a lot of data
- `TMPDIR`: Before `bun bun` completes, it stores the new `.bun` in `$TMPDIR`. If unset, `TMPDIR` defaults to the platform-specific temporary directory (on Linux, `/tmp` and on macOS `/private/tmp`)
