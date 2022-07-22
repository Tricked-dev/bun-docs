---
title: Bun:create
layout: ../../layouts/MainLayout.astro
---

`bun create` is a fast way to create a new project from a template.

At the time of writing, `bun create react app` runs ~11x faster on my local computer than `yarn create react-app app`. `bun create` currently does no caching (though your npm client does)

#### Usage

Create a new Next.js project:

```bash
bun create next ./app
```

Create a new React project:

```bash
bun create react ./app
```

Create from a GitHub repo:

```bash
bun create ahfarmer/calculator ./app
```

To see a list of examples, run:

```bash
bun create
```

Format:

```bash
bun create github-user/repo-name destination
bun create local-example-or-remote-example destination
bun create /absolute/path/to-template-folder destination
bun create https://github.com/github-user/repo-name destination
bun create github.com/github-user/repo-name destination
```

Note: you don’t need `bun create` to use bun. You don’t need any configuration at all. This command exists to make it a little easier.

#### Local templates

If you have your own boilerplate you prefer using, copy it into `$HOME/.bun-create/my-boilerplate-name`.

Before checking bun’s examples folder, `bun create` checks for a local folder matching the input in:

- `$BUN_CREATE_DIR/`
- `$HOME/.bun-create/`
- `$(pwd)/.bun-create/`

If a folder exists in any of those folders with the input, bun will use that instead of a remote template.

To create a local template, run:

```bash
mkdir -p $HOME/.bun-create/new-template-name
echo '{"name":"new-template-name"}' > $HOME/.bun-create/new-template-name/package.json
```

This lets you run:

```bash
bun create new-template-name ./app
```

Now your new template should appear when you run:

```bash
bun create
```

Warning: unlike with remote templates, **bun will delete the entire destination folder if it already exists.**

#### Flags

| Flag         | Description                            |
| ------------ | -------------------------------------- |
| --npm        | Use `npm` for tasks & install          |
| --yarn       | Use `yarn` for tasks & install         |
| --pnpm       | Use `pnpm` for tasks & install         |
| --force      | Overwrite existing files               |
| --no-install | Skip installing `node_modules` & tasks |
| --no-git     | Don’t initialize a git repository      |
| --open       | Start & open in-browser after finish   |

| Environment Variables | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| GITHUB_API_DOMAIN     | If you’re using a GitHub enterprise or a proxy, you can change what the endpoint requests to GitHub go |
| GITHUB_API_TOKEN      | This lets `bun create` work with private repositories or if you get rate-limited                       |

By default, `bun create` will cancel if there are existing files it would overwrite and it's a remote template. You can pass `--force` to disable this behavior.

#### Publishing a new template

Clone this repository and a new folder in `examples/` with your new template. The `package.json` must have a `name` that starts with `@bun-examples/`. Do not worry about publishing it, that will happen automatically after the PR is merged.

Make sure to include a `.gitignore` that includes `node_modules` so that `node_modules` aren’t checked in to git when people download the template.

#### Testing your new template

To test your new template, add it as a local template or pass the absolute path.

```bash
bun create /path/to/my/new/template destination-dir
```

Warning: **This will always delete everything in destination-dir**.

#### Config

The `bun-create` section of `package.json` is automatically removed from the `package.json` on disk. This lets you add create-only steps without waiting for an extra package to install.

There are currently two options:

- `postinstall`
- `preinstall`

They can be an array of strings or one string. An array of steps will be executed in order.

Here is an example:

```json
{
  "name": "@bun-examples/next",
  "version": "0.0.31",
  "main": "index.js",
  "dependencies": {
    "next": "11.1.2",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-is": "^17.0.2"
  },
  "devDependencies": {
    "@types/react": "^17.0.19",
    "bun-framework-next": "^0.0.0-21",
    "typescript": "^4.3.5"
  },
  "bun-create": {
    "postinstall": ["bun bun --use next"]
  }
}
```

By default, all commands run inside the environment exposed by the auto-detected npm client. This incurs a significant performance penalty, something like 150ms spent waiting for the npm client to start on each invocation.

Any command that starts with `"bun "` will be run without npm, relying on the first `bun` binary in `$PATH`.

#### How `bun create` works

When you run `bun create ${template} ${destination}`, here’s what happens:

> IF remote template

    1. GET `registry.npmjs.org/@bun-examples/${template}/latest` and parse it
    2. GET `registry.npmjs.org/@bun-examples/${template}/-/${template}-${latestVersion}.tgz`
    3. Decompress & extract `${template}-${latestVersion}.tgz` into `${destination}`

      - If there are files that would overwrite, warn and exit unless `--force` is passed

> IF github repo

    1. Download the tarball from GitHub’s API
    2. Decompress & extract into `${destination}`

      - If there are files that would overwrite, warn and exit unless `--force` is passed

> ELSE IF local template

    1. Open local template folder
    2. Delete destination directory recursively
    3. Copy files recursively using the fastest system calls available (on macOS `fcopyfile` and Linux, `copy_file_range`). Do not copy or traverse into `node_modules` folder if exists (this alone makes it faster than `cp`).
    4. Parse the `package.json` (again!), update `name` to be `${basename(destination)}`, remove the `bun-create` section from the `package.json` and save the updated `package.json` to disk.
      - IF Next.js is detected, add `bun-framework-next` to the list of dependencies
      - IF Create React App is detected, add the entry point in /src/index.{js,jsx,ts,tsx} to `public/index.html`
      - IF Relay is detected, add `bun-macro-relay` so that Relay works
    5. Auto-detect the npm client, preferring `pnpm`, `yarn` (v1), and lastly `npm`
    6. Run any tasks defined in `"bun-create": { "preinstall" }` with the npm client
    7. Run `${npmClient} install` unless `--no-install` is passed OR no dependencies are in package.json
    8. Run any tasks defined in `"bun-create": { "preinstall" }` with the npm client
    9. Run `git init; git add -A .; git commit -am "Initial Commit";`

      - Rename `gitignore` to `.gitignore`. NPM automatically removes `.gitignore` files from appearing in packages.
      - If there are dependencies, this runs in a separate thread concurrently while node_modules are being installed
      - Using libgit2 if available was tested and performed 3x slower in microbenchmarks

    10. Done

`misctools/publish-examples.js` publishes all examples to npm.
