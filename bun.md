# bun

<p align="center">
  <a href="https://bun.sh"><img src="https://bun.sh/logo@2x.png" alt="Logo"></a>
</p>

bun is a new:

- JavaScript runtime with Web APIs like [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch), [`WebSocket`](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), and several more built-in. bun embeds JavaScriptCore, which tends to be faster and more memory efficient than more popular engines like V8 (though harder to embed)
- JavaScript/TypeScript/JSX transpiler
- JavaScript & CSS bundler
- Task runner for package.json scripts
- npm-compatible package manager

All in one fast &amp; easy-to-use tool. Instead of 1,000 node_modules for development, you only need bun.

**bun is experimental software**. Join [bun’s Discord](https://bun.sh/discord) for help and have a look at [things that don’t work yet](#not-implemented-yet).

Today, bun's primary focus is bun.js: bun's JavaScript runtime.

## Table of Contents

- [bun](#bun)
  - [Table of Contents](#table-of-contents)
  - [bun:sqlite (SQLite3 module)](#bunsqlite-sqlite3-module)
    - [bun:sqlite Benchmark](#bunsqlite-benchmark)
    - [Getting started with bun:sqlite](#getting-started-with-bunsqlite)
      - [`Database`](#database)
      - [Database.prototype.query](#databaseprototypequery)
      - [Database.prototype.prepare](#databaseprototypeprepare)
      - [Database.prototype.exec & Database.prototype.run](#databaseprototypeexec--databaseprototyperun)
      - [Database.prototype.transaction](#databaseprototypetransaction)
      - [Database.prototype.serialize](#databaseprototypeserialize)
      - [Database.prototype.loadExtension](#databaseprototypeloadextension)
      - [Statement](#statement)
      - [Statement.all](#statementall)
      - [Statement.values](#statementvalues)
      - [Statement.get](#statementget)
      - [Statement.run](#statementrun)
      - [Statement.finalize](#statementfinalize)
      - [Statement.toString()](#statementtostring)
      - [Datatypes](#datatypes)
    - [`bun:ffi` (Foreign Functions Interface)](#bunffi-foreign-functions-interface)
      - [Low-overhead FFI](#low-overhead-ffi)
      - [Usage](#usage)
      - [Supported FFI types (`FFIType`)](#supported-ffi-types-ffitype)
      - [Strings (`CString`)](#strings-cstring)
        - [Returning a string](#returning-a-string)
      - [Function pointers (`CFunction`)](#function-pointers-cfunction)
      - [Pointers](#pointers)
        - [Passing a pointer](#passing-a-pointer)
        - [Reading pointers](#reading-pointers)
        - [Not implemented yet](#not-implemented-yet)
    - [Node-API (napi)](#node-api-napi)
    - [`Bun.Transpiler`](#buntranspiler)
      - [`Bun.Transpiler.transformSync`](#buntranspilertransformsync)
      - [`Bun.Transpiler.transform`](#buntranspilertransform)
      - [`Bun.Transpiler.scan`](#buntranspilerscan)
      - [`Bun.Transpiler.scanImports`](#buntranspilerscanimports)
  - [Environment variables](#environment-variables)
  - [Credits](#credits)
  - [License](#license)
  - [Developing bun](#developing-bun)
    - [VSCode Dev Container (Linux)](#vscode-dev-container-linux)
    - [MacOS](#macos)
      - [Build bun (macOS)](#build-bun-macos)
      - [Verify it worked (macOS)](#verify-it-worked-macos)
      - [Troubleshooting (macOS)](#troubleshooting-macos)
  - [vscode-zig](#vscode-zig)

## License

bun itself is MIT-licensed.

However, JavaScriptCore (and WebKit) is LGPL-2 and bun statically links it. WebCore files from WebKit are also licensed under LGPL2.

Per LGPL2:

> (1) If you statically link against an LGPL’d library, you must also provide your application in an object (not necessarily source) format, so that a user has the opportunity to modify the library and relink the application.

You can find the patched version of WebKit used by bun here: <https://github.com/jarred-sumner/webkit>. If you would like to relink bun with changes:

- `git submodule update --init --recursive`
- `make jsc`
- `zig build`

This compiles JavaScriptCore, compiles bun’s `.cpp` bindings for JavaScriptCore (which are the object files using JavaScriptCore) and outputs a new `bun` binary with your changes.

bun also statically links these libraries:

- [`boringssl`](https://boringssl.googlesource.com/boringssl/), which has [several licenses](https://boringssl.googlesource.com/boringssl/+/refs/heads/master/LICENSE)
- [`libarchive`](https://github.com/libarchive/libarchive), which has [several licenses](https://github.com/libarchive/libarchive/blob/master/COPYING)
- [`libiconv`](https://www.gnu.org/software/libiconv/), which is LGPL2. It’s a dependency of libarchive.
- [`lol-html`](https://github.com/cloudflare/lol-html/tree/master/c-api), which is MIT licensed
- [`mimalloc`](https://github.com/microsoft/mimalloc), which is MIT licensed
- [`picohttp`](https://github.com/h2o/picohttpparser), which is dual-licensed under the Perl License or the MIT License
- [`tinycc`](https://github.com/tinycc/tinycc), which is LGPL v2.1 licensed
- [`uSockets`](https://github.com/uNetworking/uSockets), which is MIT licensed
- [`zlib-cloudflare`](https://github.com/cloudflare/zlib), which is zlib licensed
- `libicu` 66.1, which can be found here: <https://github.com/unicode-org/icu/blob/main/icu4c/LICENSE>
- A fork of [`uWebsockets`](https://github.com/jarred-sumner/uwebsockets), which is MIT licensed

For compatibility reasons, these NPM packages are embedded into bun’s binary and injected if imported.

- [`assert`](https://npmjs.com/package/assert) (MIT license)
- [`browserify-zlib`](https://npmjs.com/package/browserify-zlib) (MIT license)
- [`buffer`](https://npmjs.com/package/buffer) (MIT license)
- [`constants-browserify`](https://npmjs.com/package/constants-browserify) (MIT license)
- [`crypto-browserify`](https://npmjs.com/package/crypto-browserify) (MIT license)
- [`domain-browser`](https://npmjs.com/package/domain-browser) (MIT license)
- [`events`](https://npmjs.com/package/events) (MIT license)
- [`https-browserify`](https://npmjs.com/package/https-browserify) (MIT license)
- [`os-browserify`](https://npmjs.com/package/os-browserify) (MIT license)
- [`path-browserify`](https://npmjs.com/package/path-browserify) (MIT license)
- [`process`](https://npmjs.com/package/process) (MIT license)
- [`punycode`](https://npmjs.com/package/punycode) (MIT license)
- [`querystring-es3`](https://npmjs.com/package/querystring-es3) (MIT license)
- [`stream-browserify`](https://npmjs.com/package/stream-browserify) (MIT license)
- [`stream-http`](https://npmjs.com/package/stream-http) (MIT license)
- [`string_decoder`](https://npmjs.com/package/string_decoder) (MIT license)
- [`timers-browserify`](https://npmjs.com/package/timers-browserify) (MIT license)
- [`tty-browserify`](https://npmjs.com/package/tty-browserify) (MIT license)
- [`url`](https://npmjs.com/package/url) (MIT license)
- [`util`](https://npmjs.com/package/util) (MIT license)
- [`vm-browserify`](https://npmjs.com/package/vm-browserify) (MIT license)

## Developing bun

Estimated: 30-90 minutes :(

### VSCode Dev Container (Linux)

The VSCode Dev Container in this repository is the easiest way to get started. It comes with Zig, JavaScriptCore, Zig Language Server, vscode-zig, and more pre-installed on an instance of Ubuntu.

<img src="https://user-images.githubusercontent.com/709451/147319227-6446589c-a4d9-480d-bd5b-43037a9e56fd.png" />

To get started, install the devcontainer cli:

```bash
npm install -g @vscode/dev-container-cli
```

Then, in the `bun` repository locally run:

```bash
devcontainer build
devcontainer open
```

You will need to clone the GitHub repository inside that container, which also requires authenticating with GitHub (until bun's repository is public). Make sure to login with a Personal Access Token rather than a web browser.

Inside the container, run this:

```bash
# First time setup
gh auth login
gh repo clone oven-sh/bun . -- --depth=1 --progress -j8

# update all submodules except webkit because webkit takes awhile and it's already compiled for you.
git -c submodule."src/bun.js/WebKit".update=none submodule update --init --recursive --depth=1 --progress

# Compile bun dependencies (zig is already compiled)
make devcontainer

# Build bun for development
make dev

# Run bun
bun-debug
```

It is very similar to my own development environment.

### MacOS

Install LLVM 13 and homebrew dependencies:

```bash
brew install llvm@13 coreutils libtool cmake libiconv automake openssl@1.1 ninja gnu-sed pkg-config esbuild go rust
```

bun (& the version of Zig) need LLVM 13 and Clang 13 (clang is part of LLVM). Weird build & runtime errors will happen otherwise.

Make sure LLVM 13 is in your `$PATH`:

```bash
which clang-13
```

If it is not, you will have to run this to link it:

```bash
export PATH=$(brew --prefix llvm@13)/bin:$PATH
export LDFLAGS="$LDFLAGS -L$(brew --prefix llvm@13)/lib"
export CPPFLAGS="$CPPFLAGS -I$(brew --prefix llvm@13)/include"
```

On fish that looks like `fish_add_path (brew --prefix llvm@13)/bin`

You’ll want to make sure `zig` is in `$PATH`. The specific version of Zig expected is the HEAD in [Jarred-Sumner/zig](https://github.com/Jarred-Sumner/zig).

#### Build bun (macOS)

If you're building on a macOS device, you'll need to have a valid Developer Certificate, or else the code signing step will fail. To check if you have one, open the `Keychain Access` app, go to the `login` profile and search for `Apple Development`. You should have at least one certificate with a name like `Apple Development: user@example.com (WDYABC123)`. If you don't have one, follow [this guide](https://ioscodesigning.com/generating-code-signing-files/#generate-a-code-signing-certificate-using-xcode) to get one.

In `bun`:

```bash
# If you omit --depth=1, `git submodule update` will take 17.5 minutes on 1gbps internet, mostly due to WebKit.
git submodule update --init --recursive --progress --depth=1
make vendor identifier-cache jsc dev
```

#### Verify it worked (macOS)

First ensure the node dependencies are installed

```bash
(cd test/snippets && npm i)
(cd test/scripts && npm i)
```

Then

```bash
make test-dev-all
```

#### Troubleshooting (macOS)

If you see an error when compiling `libarchive`, run this:

```bash
brew install pkg-config
```

If you see an error about missing files on `zig build obj`, make sure you built the headers

## vscode-zig

Note: this is automatically installed on the devcontainer

You will want to install the fork of `vscode-zig` so you get a `Run test` and a `Debug test` button.

To do that:

```bash
curl -L https://github.com/Jarred-Sumner/vscode-zig/releases/download/fork-v1/zig-0.2.5.vsix > vscode-zig.vsix
code --install-extension vscode-zig.vsix
```

<a target="_blank" href="https://github.com/jarred-sumner/vscode-zig"><img src="https://pbs.twimg.com/media/FBZsKHlUcAYDzm5?format=jpg&name=large"></a>

