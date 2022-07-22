---
title: Bun:bun
layout: ../../layouts/MainLayout.astro
---

`bun run` is a fast `package.json` script runner. Instead of waiting 170ms for your npm client to start every time, you wait 6ms for bun.

By default, `bun run` prints the script that will be invoked:

```bash
bun run clean
$ rm -rf node_modules/.cache dist
```

You can disable that with `--silent`

```bash
bun run --silent clean
```

`bun run ${script-name}` runs the equivalent of `npm run script-name`. For example, `bun run dev` runs the `dev` script in `package.json`, which may sometimes spin up non-bun processes.

`bun run ${javascript-file.js}` will run it with bun, as long as the file doesn't have a node shebang.

To print a list of `scripts`, `bun run` without additional args:

```bash
# This command
bun run

# Prints this
hello-create-react-app scripts:

bun run start
react-scripts start

bun run build
react-scripts build

bun run test
react-scripts test

bun run eject
react-scripts eject

4 scripts
```

### `bun bun`

Run `bun bun ./path-to.js` to generate a `node_modules.bun` file containing all imported dependencies (recursively).

#### Why bundle?

- For browsers, loading entire apps without bundling dependencies is typically slow. With a fast bundler & transpiler, the bottleneck eventually becomes the web browser’s ability to run many network requests concurrently. There are many workarounds for this. `<link rel="modulepreload">`, HTTP/3, etc but none are more effective than bundling. If you have reproducible evidence to the contrary, feel free to submit an issue. It would be better if bundling wasn’t necessary.
- On the server, bundling reduces the number of filesystem lookups to load JavaScript. While filesystem lookups are faster than HTTP requests, there’s still overhead.

#### What is `.bun`?

Note: [This format may change soon](https://github.com/Jarred-Sumner/bun/issues/121)

The `.bun` file contains:

- all the bundled source code
- all the bundled source code metadata
- project metadata & configuration

Here are some of the questions `.bun` files answer:

- when I import `react/index.js`, where in the `.bun` is the code for that? (not resolving, just the code)
- what modules of a package are used?
- what framework is used? (e.g. Next.js)
- where is the routes directory?
- how big is each imported dependency?
- what is the hash of the bundle’s contents? (for etags)
- what is the name & version of every npm package exported in this bundle?
- what modules from which packages are used in this project? ("project" is defined as all the entry points used to generate the .bun)

All in one file.

It’s a little like a build cache but designed for reuse across builds.

#### Position-independent code

From a design perspective, the most important part of the `.bun` format is how code is organized. Each module is exported by a hash like this:

```js
// preact/dist/preact.module.js
export var $eb6819b = $$m({
  "preact/dist/preact.module.js": (module, exports) => {
    var n, l, u, i, t, o, r, f, e = {}, c = [], s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
    // ... rest of code
```

This makes bundled modules [position-independent](https://en.wikipedia.org/wiki/Position-independent_code). In theory, one could import only the exact modules in-use without reparsing code and without generating a new bundle. One bundle can dynamically become many bundles comprising only the modules in use on the webpage. Thanks to the metadata with the byte offsets, a web server can send each module to browsers [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) using [sendfile](https://man7.org/linux/man-pages/man2/sendfile.2.html). bun itself is not quite this smart yet, but these optimizations would be useful in production and potentially very useful for React Server Components.

To see the schema inside, have a look at [`JavascriptBundleContainer`](./src/api/schema.d.ts#:~:text=export%20interface-,JavascriptBundleContainer,-%7B). You can find JavaScript bindings to read the metadata in [src/api/schema.js](./src/api/schema.js). This is not really an API yet. It’s missing the part where it gets the binary data from the bottom of the file. Someday, I want this to be usable by other tools too.

#### Where is the code?

`.bun` files are marked as executable.

To print out the code, run `./node_modules.bun` in your terminal or run `bun ./path-to-node_modules.bun`.

Here is a copy-pastable example:

```bash
./node_modules.bun > node_modules.js
```

This works because every `.bun` file starts with this:

```bash
#!/usr/bin/env bun
```

To deploy to production with bun, you’ll want to get the code from the `.bun` file and stick that somewhere your web server can find it (or if you’re using Vercel or a Rails app, in a `public` folder).

Note that `.bun` is a binary file format, so just opening it in VSCode or vim might render strangely.

#### Advanced

By default, `bun bun` only bundles external dependencies that are `import`ed or `require`d in either app code or another external dependency. An "external dependency" is defined as, "A JavaScript-like file that has `/node_modules/` in the resolved file path and a corresponding `package.json`".

To force bun to bundle packages which are not located in a `node_modules` folder (i.e. the final, resolved path following all symlinks), add a `bun` section to the root project’s `package.json` with `alwaysBundle` set to an array of package names to always bundle. Here’s an example:

```json
{
  "name": "my-package-name-in-here",
  "bun": {
    "alwaysBundle": ["@mybigcompany/my-workspace-package"]
  }
}
```

Bundled dependencies are not eligible for Hot Module Reloading. The code is served to browsers & bun.js verbatim. But, in the future, it may be sectioned off into only parts of the bundle being used. That’s possible in the current version of the `.bun` file (so long as you know which files are necessary), but it’s not implemented yet. Longer-term, it will include all `import` and `export` of each module inside.

#### What is the module ID hash?

The `$eb6819b` hash used here:

```js
export var $eb6819b = $$m({
```

Is generated like this:

1. Murmur3 32-bit hash of `package.name@package.version`. This is the hash uniquely identifying the npm package.
2. Wyhash 64 of the `package.hash` + `package_path`. `package_path` means "relative to the root of the npm package, where is the module imported?". For example, if you imported `react/jsx-dev-runtime.js`, the `package_path` is `jsx-dev-runtime.js`. `react-dom/cjs/react-dom.development.js` would be `cjs/react-dom.development.js`
3. Truncate the hash generated above to a `u32`

The implementation details of this module ID hash will vary between versions of bun. The important part is the metadata contains the module IDs, the package paths, and the package hashes so it shouldn’t really matter in practice if other tooling wants to make use of any of this.
