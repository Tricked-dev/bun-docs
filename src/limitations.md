## Limitations & intended usage

Today, bun is mostly focused on bun.js: the JavaScript runtime.

While you could use bun's bundler & transpiler separately to build for browsers or node, bun doesn't have a minifier or support tree-shaking yet. For production browser builds, you probably should use a tool like esbuild or swc.

Longer-term, bun intends to replace Node.js, Webpack, Babel, yarn, and PostCSS (in production).

## Upcoming breaking changes

- Bun's CLI flags will change to better support bun as a JavaScript runtime. They were chosen when bun was just a frontend development tool.
- Bun's bundling format will change to accommodate production browser bundles and on-demand production bundling

