---
title: NodeJS API
layout: ../../layouts/MainLayout.astro
---

Bun.js implements 90% of the APIs available in [Node-API](https://nodejs.org/api/n-api.html) (napi).

You can see the status of [this here](https://github.com/Jarred-Sumner/bun/issues/158).

Loading Node-API modules in Bun.js works the same as in Node.js:

```js
const napi = require("./my-node-module.node");
```

You can also use `process.dlopen`:

```js
var mod = { exports: {} };
process.dlopen(mod, "./my-node-module.node");
```

As part of that work, Bun.js also polyfills the [`detect-libc`](https://npmjs.com/package/detect-libc) package, which is used by many Node-API modules to detect which `.node` binding to `require`.

This implementation of Node-API is from scratch. It doesn't use any code from Node.js.

**Some implementation details**

When requiring a `*.node` module, Bun's JavaScript transpiler transforms the `require` expression into call to `import.meta.require`:

```js
// this is the input
require("./my-node-module.node");

// this is the output
import.meta.require("./my-node-module.node");
```

Bun doesn't currently support dynamic requires, but `import.meta.require` is an escape hatch for that. It uses a [JavaScriptCore builtin function](https://github.com/Jarred-Sumner/bun/blob/aa87d40f4b7fdfb52575f44d151906ddba6a82d0/src/bun.js/bindings/builtins/js/JSZigGlobalObject.js#L26).
