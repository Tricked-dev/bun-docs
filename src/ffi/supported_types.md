#### Supported FFI types (`FFIType`)

| `FFIType` | C Type     | Aliases                     |
| --------- | ---------- | --------------------------- |
| cstring   | `char*`    |                             |
| ptr       | `void*`    | `pointer`, `void*`, `char*` |
| i8        | `int8_t`   | `int8_t`                    |
| i16       | `int16_t`  | `int16_t`                   |
| i32       | `int32_t`  | `int32_t`, `int`            |
| i64       | `int64_t`  | `int32_t`                   |
| u8        | `uint8_t`  | `uint8_t`                   |
| u16       | `uint16_t` | `uint16_t`                  |
| u32       | `uint32_t` | `uint32_t`                  |
| u64       | `uint64_t` | `uint32_t`                  |
| f32       | `float`    | `float`                     |
| f64       | `double`   | `double`                    |
| bool      | `bool`     |                             |
| char      | `char`     |                             |

#### Strings (`CString`)

JavaScript strings and C-like strings are different, and that complicates using strings with native libraries.

<details>
<summary>How are JavaScript strings and C strings different?</summary>

JavaScript strings:

- UTF16 (2 bytes per letter) or potentially latin1, depending on the JavaScript engine &amp; what characters are used
- `length` stored separately
- Immutable

C strings:

- UTF8 (1 byte per letter), usually
- The length is not stored. Instead, the string is null-terminated which means the length is the index of the first `\0` it finds
- Mutable

</details>

To help with that, `bun:ffi` exports `CString` which extends JavaScript's built-in `String` to support null-terminated strings and add a few extras:

```ts
class CString extends String {
  /**
   * Given a `ptr`, this will automatically search for the closing `\0` character and transcode from UTF-8 to UTF-16 if necessary.
   */
  constructor(ptr: number, byteOffset?: number, byteLength?: number): string;

  /**
   * The ptr to the C string
   *
   * This `CString` instance is a clone of the string, so it
   * is safe to continue using this instance after the `ptr` has been
   * freed.
   */
  ptr: number;
  byteOffset?: number;
  byteLength?: number;
}
```

To convert from a null-terminated string pointer to a JavaScript string:

```ts
const myString = new CString(ptr);
```

To convert from a pointer with a known length to a JavaScript string:

```ts
const myString = new CString(ptr, 0, byteLength);
```

`new CString` clones the C string, so it is safe to continue using `myString` after `ptr` has been freed.

```ts
my_library_free(myString.ptr);

// this is safe because myString is a clone
console.log(myString);
```

##### Returning a string

When used in `returns`, `FFIType.cstring` coerces the pointer to a JavaScript `string`. When used in `args`, `cstring` is identical to `ptr`.

#### Function pointers (`CFunction`)

To call a function pointer from JavaScript, use `CFunction`

This is useful if using Node-API (napi) with Bun, and you've already loaded some symbols.

```ts
import { CFunction } from "bun:ffi";

var myNativeLibraryGetVersion = /* somehow, you got this pointer */

const getVersion = new CFunction({
  returns: "cstring",
  args: [],
  ptr: myNativeLibraryGetVersion,
});
getVersion();
```

If you have multiple function pointers, you can define them all at once with `linkSymbols`:

```ts
import { linkSymbols } from "bun:ffi";

// getVersionPtrs defined elsewhere
const [majorPtr, minorPtr, patchPtr] = getVersionPtrs();

const lib = linkSymbols({
  // Unlike with dlopen(), the names here can be whatever you want
  getMajor: {
    returns: "cstring",
    args: [],

    // Since this doesn't use dlsym(), you have to provide a valid ptr
    // That ptr could be a number or a bigint
    // An invalid pointer will crash your program.
    ptr: majorPtr,
  },
  getMinor: {
    returns: "cstring",
    args: [],
    ptr: minorPtr,
  },
  getPatch: {
    returns: "cstring",
    args: [],
    ptr: patchPtr,
  },
});

const [major, minor, patch] = [
  lib.symbols.getMajor(),
  lib.symbols.getMinor(),
  lib.symbols.getPatch(),
];
```

#### Pointers

Bun represents [pointers](<https://en.wikipedia.org/wiki/Pointer_(computer_programming)>) as a `number` in JavaScript.

<details>

<summary>How does a 64 bit pointer fit in a JavaScript number?</summary>

64-bit processors support up to [52 bits of addressable space](https://en.wikipedia.org/wiki/64-bit_computing#Limits_of_processors).

[JavaScript numbers](https://en.wikipedia.org/wiki/Double-precision_floating-point_format#IEEE_754_double-precision_binary_floating-point_format:_binary64) support 53 bits of usable space, so that leaves us with about 11 bits of extra space.

Why not `BigInt`?

`BigInt` is slower. JavaScript engines allocate a separate `BigInt` which means they can't just fit in a regular javascript value.

If you pass a `BigInt` to a function, it will be converted to a `number`

</details>

**To convert from a TypedArray to a pointer**:

```ts
import { ptr } from "bun:ffi";
var myTypedArray = new Uint8Array(32);
const myPtr = ptr(myTypedArray);
```

**To convert from a pointer to an ArrayBuffer**:

```ts
import { ptr, toArrayBuffer } from "bun:ffi";
var myTypedArray = new Uint8Array(32);
const myPtr = ptr(myTypedArray);

// toTypedArray accepts a `byteOffset` and `byteLength`
// if `byteLength` is not provided, it is assumed to be a null-terminated pointer
myTypedArray = new Uint8Array(toArrayBuffer(myPtr, 0, 32), 0, 32);
```

**Pointers & memory safety**

Using raw pointers outside of FFI is extremely not recommended.

A future version of bun may add a CLI flag to disable `bun:ffi` (or potentially a separate build of bun).

**Pointer alignment**

If an API expects a pointer sized to something other than `char` or `u8`, make sure the typed array is also that size.

A `u64*` is not exactly the same as `[8]u8*` due to alignment

##### Passing a pointer

Where FFI functions expect a pointer, pass a TypedArray of equivalent size

Easymode:

```ts
import { dlopen, FFIType } from "bun:ffi";

const {
  symbols: { encode_png },
} = dlopen(myLibraryPath, {
  encode_png: {
    // FFIType's can be specified as strings too
    args: ["ptr", "u32", "u32"],
    returns: FFIType.ptr,
  },
});

const pixels = new Uint8ClampedArray(128 * 128 * 4);
pixels.fill(254);
pixels.subarray(0, 32 * 32 * 2).fill(0);

const out = encode_png(
  // pixels will be passed as a pointer
  pixels,

  128,
  128
);
```

The [auto-generated wrapper](https://github.com/oven-sh/bun/blob/c6d732eee2721cd6191672cbe2c57fb17c3fffe4/src/bun.js/ffi.exports.js#L146-L148) converts the pointer to a TypedArray

<details>

<summary>Hardmode</summary>

If you don't want the automatic conversion or you want a pointer to a specific byte offset within the TypedArray, you can also directly get the pointer to the TypedArray:

```ts
import { dlopen, FFIType, ptr } from "bun:ffi";

const {
  symbols: { encode_png },
} = dlopen(myLibraryPath, {
  encode_png: {
    // FFIType's can be specified as strings too
    args: ["ptr", "u32", "u32"],
    returns: FFIType.ptr,
  },
});

const pixels = new Uint8ClampedArray(128 * 128 * 4);
pixels.fill(254);

// this returns a number! not a BigInt!
const myPtr = ptr(pixels);

const out = encode_png(
  myPtr,

  // dimensions:
  128,
  128
);
```

</details>

##### Reading pointers

```ts
const out = encode_png(
  // pixels will be passed as a pointer
  pixels,

  // dimensions:
  128,
  128
);

// assuming it is 0-terminated, it can be read like this:
var png = new Uint8Array(toArrayBuffer(out));

// save it to disk:
await Bun.write("out.png", png);
```

##### Not implemented yet

`bun:ffi` has a few more things planned but not implemented yet:

- callback functions
- async functions

### Node-API (napi)

Bun.js implements 90% of the APIs available in [Node-API](https://nodejs.org/api/n-api.html) (napi).

You can see the status of [this here](https://github.com/oven-sh/bun/issues/158).

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

When requiring a `*.node` module, Bun's JavaScript transpiler transforms the `require` expression into a call to `import.meta.require`:

```js
// this is the input
require("./my-node-module.node");

// this is the output
import.meta.require("./my-node-module.node");
```

Bun doesn't currently support dynamic requires, but `import.meta.require` is an escape hatch for that. It uses a [JavaScriptCore built-in function](https://github.com/oven-sh/bun/blob/aa87d40f4b7fdfb52575f44d151906ddba6a82d0/src/bun.js/bindings/builtins/js/JSZigGlobalObject.js#L26).
