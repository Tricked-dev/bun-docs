#### Low-overhead FFI

3ns to go from JavaScript <> native code with `bun:ffi` (on my machine, an M1 Pro with 64GB of RAM)

- 5x faster than napi (Node v17.7.1)
- 100x faster than Deno v1.21.1

As measured in [this simple benchmark](./bench/ffi/plus100)

<img src="https://user-images.githubusercontent.com/709451/166429741-e6d83ca5-3808-4397-acb7-bb2c9f4329be.png" height="400">

<details>

<summary>Why is bun:ffi fast?</summary>

Bun generates & just-in-time compiles C bindings that efficiently convert values between JavaScript types and native types.

To compile C, Bun embeds [TinyCC](https://github.com/TinyCC/tinycc), a small and fast C compiler.

</details>

