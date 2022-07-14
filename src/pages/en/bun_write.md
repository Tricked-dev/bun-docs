---
title: Bun.write – optimizing I/O
layout: ../../layouts/MainLayout.astro
---

`Bun.write` lets you write, copy or pipe files automatically using the fastest system calls compatible with the input and platform.

```ts
interface Bun {
  write(
    destination: string | number | FileBlob,
    input: string | FileBlob | Blob | ArrayBufferView
  ): Promise<number>;
}
```

| Output                     | Input          | System Call                   | Platform |
| -------------------------- | -------------- | ----------------------------- | -------- |
| file                       | file           | copy_file_range               | Linux    |
| file                       | pipe           | sendfile                      | Linux    |
| pipe                       | pipe           | splice                        | Linux    |
| terminal                   | file           | sendfile                      | Linux    |
| terminal                   | terminal       | sendfile                      | Linux    |
| socket                     | file or pipe   | sendfile (if http, not https) | Linux    |
| file (path, doesn't exist) | file (path)    | clonefile                     | macOS    |
| file                       | file           | fcopyfile                     | macOS    |
| file                       | Blob or string | write                         | macOS    |
| file                       | Blob or string | write                         | Linux    |

All this complexity is handled by a single function.

```ts
// Write "Hello World" to output.txt
await Bun.write("output.txt", "Hello World");
```

```ts
// log a file to stdout
await Bun.write(Bun.stdout, Bun.file("input.txt"));
```

```ts
// write the HTTP response body to disk
await Bun.write("index.html", await fetch("http://example.com"));
// this does the same thing
await Bun.write(Bun.file("index.html"), await fetch("http://example.com"));
```

```ts
// copy input.txt to output.txt
await Bun.write("output.txt", Bun.file("input.txt"));
```
