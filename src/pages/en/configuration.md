---
title: Configuration
layout: ../../layouts/MainLayout.astro
---

### bunfig.toml

bunfig.toml is bun's configuration file.

It lets you load configuration from a file instead of passing flags to the CLI each time. The config file is loaded before CLI arguments are parsed, which means CLI arguments can override them.

Here is an example:

```toml
# Set a default framework to use
# By default, bun will look for an npm package like `bun-framework-${framework}`, followed by `${framework}`
framework = "next"
logLevel = "debug"

# publicDir = "public"
# external = ["jquery"]

[macros]
# Remap any import like this:
#     import {graphql} from 'react-relay';
# To:
#     import {graphql} from 'macro:bun-macro-relay';
react-relay = { "graphql" = "bun-macro-relay" }

[bundle]
saveTo = "node_modules.bun"
# Don't need this if `framework` is set, but showing it here as an example anyway
entryPoints = ["./app/index.ts"]

[bundle.packages]
# If you're bundling packages that do not actually live in a `node_modules` folder or do not have the full package name in the file path, you can pass this to bundle them anyway
"@bigapp/design-system" = true

[dev]
# Change the default port from 3000 to 5000
# Also inherited by Bun.serve
port = 5000

[define]
# Replace any usage of "process.env.bagel" with the string `lox`.
# The values are parsed as JSON, except single-quoted strings are supported and `'undefined'` becomes `undefined` in JS.
# This will probably change in a future release to be just regular TOML instead. It is a holdover from the CLI argument parsing.
"process.env.bagel" = "'lox'"

[loaders]
# When loading a .bagel file, run the JS parser
".bagel" = "js"

[debug]
# When navigating to a blob: or src: link, open the file in your editor
# If not, it tries $EDITOR or $VISUAL
# If that still fails, it will try Visual Studio Code, then Sublime Text, then a few others
# This is used by Bun.openInEditor()
editor = "code"

# List of editors:
# - "subl", "sublime"
# - "vscode", "code"
# - "textmate", "mate"
# - "idea"
# - "webstorm"
# - "nvim", "neovim"
# - "vim","vi"
# - "emacs"
# - "atom"
# If you pass it a file path, it will open with the file path instead
# It will recognize non-GUI editors, but I don't think it will work yet
```

TODO: list each property name

##### When `platform` is `browser`

```js
globalThis.document?.dispatchEvent(
  new CustomEvent("onimportcss", {
    detail: "http://localhost:3000/styles/globals.css",
  })
);
```

An event handler for turning that into a `<link>` is automatically registered when HMR is enabled. That event handler can be turned off either in a framework’s `package.json` or by setting `globalThis["Bun_disableCSSImports"] = true;` in client-side code. Additionally, you can get a list of every .css file imported this way via `globalThis["__BUN"].allImportedStyles`.

##### When `platform` is `bun`

```js
//@import url("http://localhost:3000/styles/globals.css");
```

Additionally, bun exposes an API for SSR/SSG that returns a flat list of URLs to css files imported. That function is `Bun.getImportedStyles()`.

```ts
// This specifically is for "framework" in package.json when loaded via `bun dev`
// This API needs to be changed somewhat to work more generally with Bun.js
// Initially, you could only use bun.js through `bun dev`
// and this API was created at that time
addEventListener("fetch", async (event: FetchEvent) => {
  var route = Bun.match(event);
  const App = await import("pages/_app");

  // This returns all .css files that were imported in the line above.
  // It’s recursive, so any file that imports a CSS file will be included.
  const appStylesheets = bun.getImportedStyles();

  // ...rest of code
});
```

This is useful for preventing flash of unstyled content.
