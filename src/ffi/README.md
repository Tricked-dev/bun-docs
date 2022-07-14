### `bun:ffi` (Foreign Functions Interface)

`bun:ffi` lets you efficiently call native libraries from JavaScript. It works with languages that support the C ABI (Zig, Rust, C/C++, C#, Nim, Kotlin, etc).

This snippet prints sqlite3's version number:

```ts
import { dlopen, FFIType, suffix } from "bun:ffi";

// `suffix` is either "dylib", "so", or "dll" depending on the platform
// you don't have to use "suffix", it's just there for convenience
const path = `libsqlite3.${suffix}`;

const {
  symbols: {
    // sqlite3_libversion is the function we will call
    sqlite3_libversion,
  },
} =
  // dlopen() expects:
  // 1. a library name or file path
  // 2. a map of symbols
  dlopen(path, {
    // `sqlite3_libversion` is a function that returns a string
    sqlite3_libversion: {
      // sqlite3_libversion takes no arguments
      args: [],
      // sqlite3_libversion returns a pointer to a string
      returns: FFIType.cstring,
    },
  });

console.log(`SQLite 3 version: ${sqlite3_libversion()}`);
```
