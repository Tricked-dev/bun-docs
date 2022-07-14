---
title: Examples
layout: ../../layouts/MainLayout.astro
---

## Creating a Discord bot with Bun

### Application Commands

> Application commands are native ways to interact with apps in the Discord client. There are 3 types of commands accessible in different interfaces: the chat input, a message's context menu (top-right menu or right-clicking in a message), and a user's context menu (right-clicking on a user).

To get started you can use the interactions template:

```bash
bun create discord-interactions my-interactions-bot
cd my-interactions-bot
```

If you don't have a Discord bot/application yet, you can create one [here (https://discord.com/developers/applications/me)](https://discord.com/developers/applications/me).

Invite bot to your server by visiting `https://discord.com/api/oauth2/authorize?client_id=<your_application_id>&scope=bot%20applications.commands`

Afterwards you will need to get your bot's token, public key, and application id from the application page and put them into `.env.example` file

Then you can run the http server that will handle your interactions:

```bash
bun install
mv .env.example .env

bun run.js # listening on port 1337
```

Discord does not accept an insecure HTTP server, so you will need to provide an SSL certificate or put the interactions server behind a secure reverse proxy. For development, you can use ngrok/cloudflare tunnel to expose local ports as secure URL.

## Using bun with Next.js

To create a new Next.js app with bun:

```bash
bun create next ./app
cd app
bun dev # start dev server
```

To use an existing Next.js app with bun:

```bash
bun add bun-framework-next
echo "framework = 'next'" > bunfig.toml
bun bun # bundle dependencies
bun dev # start dev server
```

Many of Next.js’ features are supported, but not all.

Here’s what doesn’t work yet:

- `getStaticPaths`
- same-origin `fetch` inside of `getStaticProps` or `getServerSideProps`
- locales, zones, `assetPrefix` (workaround: change `--origin \"http://localhost:3000/assetPrefixInhere\"`)
- `next/image` is polyfilled to a regular `<img src>` tag.
- `proxy` and anything else in `next.config.js`
- API routes, middleware (middleware is easier to support, though! Similar SSR API)
- styled-jsx (technically not Next.js, but often used with it)
- React Server Components

When using Next.js, bun automatically reads configuration from `.env.local`, `.env.development` and `.env` (in that order). `process.env.NEXT_PUBLIC_` and `process.env.NEXT_` automatically are replaced via `--define`.

Currently, any time you import new dependencies from `node_modules`, you will need to re-run `bun bun --use next`. This will eventually be automatic.

## Using bun with single-page apps

In your project folder root (where `package.json` is):

```bash
bun bun ./entry-point-1.js ./entry-point-2.jsx
bun
```

By default, `bun` will look for any HTML files in the `public` directory and serve that. For browsers navigating to the page, the `.html` file extension is optional in the URL, and `index.html` will automatically rewrite for the directory.

Here are examples of routing from `public/` and how they’re matched:
| Dev Server URL | File Path |
|----------------|-----------|
| /dir | public/dir/index.html |
| / | public/index.html |
| /index | public/index.html |
| /hi | public/hi.html |
| /file | public/file.html |
| /font/Inter.woff2 | public/font/Inter.woff2 |
| /hello | public/index.html |

If `public/index.html` exists, it becomes the default page instead of a 404 page, unless that pathname has a file extension.

### Using bun with Create React App

To create a new React app:

```bash
bun create react ./app
cd app
bun dev # start dev server
```

To use an existing React app:

```bash
# To enable React Fast Refresh, ensure it is installed
bun add -d react-refresh

# Generate a bundle for your entry point(s)
bun bun ./src/index.js # jsx, tsx, ts also work. can be multiple files

# Start the dev server
bun dev
```

From there, bun relies on the filesystem for mapping dev server paths to source files. All URL paths are relative to the project root (where `package.json` is located).

Here are examples of routing source code file paths:

| Dev Server URL             | File Path (relative to cwd) |
| -------------------------- | --------------------------- |
| /src/components/Button.tsx | src/components/Button.tsx   |
| /src/index.tsx             | src/index.tsx               |
| /pages/index.js            | pages/index.js              |

You do not need to include file extensions in `import` paths. CommonJS-style import paths without the file extension work.

You can override the public directory by passing `--public-dir="path-to-folder"`.

If no directory is specified and `./public/` doesn’t exist, bun will try `./static/`. If `./static/` does not exist, but won’t serve from a public directory. If you pass `--public-dir=./` bun will serve from the current directory, but it will check the current directory last instead of first.

## Using bun with TypeScript

### Transpiling TypeScript with Bun

TypeScript just works. There’s nothing to configure and nothing extra to install. If you import a `.ts` or `.tsx` file, bun will transpile it into JavaScript. bun also transpiles `node_modules` containing `.ts` or `.tsx` files. This is powered by bun’s TypeScript transpiler, so it’s fast.

bun also reads `tsconfig.json`, including `baseUrl` and `paths`.

### Adding Type Definitions

To get TypeScript working with the global API, add `bun-types` to your project:

```sh
bun add -d bun-types
```

And to the `types` field in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["bun-types"]
  }
}
```

## Not implemented yet

bun is a project with an incredibly large scope and is still in its early days.

You can see [Bun's Roadmap](https://github.com/oven-sh/bun/issues/159), but here are some additional things that are planned:

| Feature                                                                               | In             |
| ------------------------------------------------------------------------------------- | -------------- |
| Web Streams with Fetch API                                                            | bun.js         |
| Web Streams with HTMLRewriter                                                         | bun.js         |
| WebSocket Server                                                                      | bun.js         |
| Package hoisting that matches npm behavior                                            | bun install    |
| Source Maps (unbundled is supported)                                                  | JS Bundler     |
| Source Maps                                                                           | CSS            |
| JavaScript Minifier                                                                   | JS Transpiler  |
| CSS Minifier                                                                          | CSS            |
| CSS Parser (it only bundles)                                                          | CSS            |
| Tree-shaking                                                                          | JavaScript     |
| Tree-shaking                                                                          | CSS            |
| [`extends`](https://www.typescriptlang.org/tsconfig#extends) in tsconfig.json         | TS Transpiler  |
| [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) | TS Transpiler  |
| `@jsxPragma` comments                                                                 | JS Transpiler  |
| Sharing `.bun` files                                                                  | bun            |
| Dates & timestamps                                                                    | TOML parser    |
| [Hash components for Fast Refresh](https://github.com/oven-sh/bun/issues/18)          | JSX Transpiler |

<small>
JS Transpiler == JavaScript Transpiler
<br/>
TS Transpiler == TypeScript Transpiler
<br/>
Package manager == <code>bun install</code>
<br/>
bun.js == bun’s JavaScriptCore integration that executes JavaScript. Similar to how Node.js & Deno embed V8.
</small>
