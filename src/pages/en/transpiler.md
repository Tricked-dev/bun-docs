---
title: Bun.Transpiler
layout: ../../layouts/MainLayout.astro
---

`Bun.Transpiler` lets you use Bun's transpiler from JavaScript (available in Bun.js)

````ts
type Loader = "jsx" | "js" | "ts" | "tsx";

interface TranspilerOptions {
  // Replace key with value. Value must be a JSON string.
  // @example
  // ```
  // { "process.env.NODE_ENV": "\"production\"" }
  // ```
  define: Record<string, string>,

  // What is the default loader used for this transpiler?
  loader: Loader,

  // What platform are we targeting? This may affect how import and/or require is used
  platform: "browser" | "bun" | "macro" | "node",

  // TSConfig.json file as stringified JSON or an object
  // Use this to set a custom JSX factory, fragment, or import source
  // For example, if you want to use Preact instead of React. Or if you want to use Emotion.
  tsconfig: string | TSConfig,

  // Replace imports with macros
  macros: MacroMap,
}

// This lets you use macros
interface MacroMap {
  // @example
  // ```
  // {
  //   "react-relay": {
  //     "graphql": "bun-macro-relay/bun-macro-relay.tsx"
  //   }
  // }
  // ```
  [packagePath: string]: {
    [importItemName: string]: string,
  },
}

class Bun.Transpiler {
  constructor(options: TranspilerOptions)

  transform(code: string, loader?: Loader): Promise<string>
  transformSync(code: string, loader?: Loader): string

  scan(code: string): {exports: string[], imports: Import}
  scanImports(code: string): Import[]
}

type Import = {
  path: string,
  kind:
  // import foo from 'bar'; in JavaScript
  | "import-statement"
  // require("foo") in JavaScript
  | "require-call"
  // require.resolve("foo") in JavaScript
  | "require-resolve"
  // Dynamic import() in JavaScript
  | "dynamic-import"
  // @import() in CSS
  | "import-rule"
  // url() in CSS
  | "url-token"
  // The import was injected by Bun
  | "internal"
  // Entry point
  // Probably won't see this one
  | "entry-point"
}

const transpiler = new Bun.Transpiler({ loader: "jsx" });
````

#### `Bun.Transpiler.transformSync`

This lets you transpile JavaScript, TypeScript, TSX, and JSX using Bun's transpiler. It does not resolve modules.

It is synchronous and runs in the same thread as other JavaScript code.

```js
const transpiler = new Bun.Transpiler({ loader: "jsx" });
transpiler.transformSync("<div>hi!</div>");
```

```js
import { __require as require } from "bun:wrap";
import * as JSX from "react/jsx-dev-runtime";
var jsx = require(JSX).jsxDEV;

export default jsx(
  "div",
  {
    children: "hi!",
  },
  undefined,
  false,
  undefined,
  this
);
```

If a macro is used, it will be run in the same thread as the transpiler, but in a separate event loop from the rest of your application. Currently, globals between macros and regular code are shared, which means it is possible (but not recommended) to share states between macros and regular code. Attempting to use AST nodes outside of a macro is undefined behavior.

#### `Bun.Transpiler.transform`

This lets you transpile JavaScript, TypeScript, TSX, and JSX using Bun's transpiler. It does not resolve modules.

It is async and automatically runs in Bun's worker threadpool. That means, if you run it 100 times, it will run it across `Math.floor($cpu_count * 0.8)` threads without blocking the main JavaScript thread.

If code uses a macro, it will potentially spawn a new copy of Bun.js' JavaScript runtime environment in that new thread.

Unless you're transpiling _many_ large files, you should probably use `Bun.Transpiler.transformSync`. The cost of the threadpool will often take longer than actually transpiling code.

```js
const transpiler = new Bun.Transpiler({ loader: "jsx" });
await transpiler.transform("<div>hi!</div>");
```

```js
import { __require as require } from "bun:wrap";
import * as JSX from "react/jsx-dev-runtime";
var jsx = require(JSX).jsxDEV;

export default jsx(
  "div",
  {
    children: "hi!",
  },
  undefined,
  false,
  undefined,
  this
);
```

You can also pass a `Loader` as a string

```js
await transpiler.transform("<div>hi!</div>", "tsx");
```

#### `Bun.Transpiler.scan`

This is a fast way to get a list of imports & exports used in a JavaScript/jsx or TypeScript/tsx file.

This function is synchronous.

```ts
const transpiler = new Bun.Transpiler({ loader: "ts" });

transpiler.scan(`
import React from 'react';
import Remix from 'remix';
import type {ReactNode} from 'react';

export const loader = () => import('./loader');
`);
```

```ts
{
  "exports": [
    "loader"
  ],
  "imports": [
    {
      "kind": "import-statement",
      "path": "react"
    },
    {
      "kind": "import-statement",
      "path": "remix"
    },
    {
      "kind": "dynamic-import",
      "path": "./loader"
    }
  ]
}

```

#### `Bun.Transpiler.scanImports`

This is a fast path for getting a list of imports used in a JavaScript/jsx or TypeScript/tsx file. It skips the visiting pass, which means it is faster but less accurate. You probably won't notice a difference between `Bun.Transpiler.scan` and `Bun.Transpiler.scanImports` often. You might notice it for very large files (megabytes).

This function is synchronous.

```ts
const transpiler = new Bun.Transpiler({ loader: "ts" });

transpiler.scanImports(`
import React from 'react';
import Remix from 'remix';
import type {ReactNode} from 'react';

export const loader = () => import('./loader');
`);
```

```json
[
  {
    "kind": "import-statement",
    "path": "react"
  },
  {
    "kind": "import-statement",
    "path": "remix"
  },
  {
    "kind": "dynamic-import",
    "path": "./loader"
  }
]
```

x
