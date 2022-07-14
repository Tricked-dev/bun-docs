## `Bun.serve` - fast HTTP server

For a hello world HTTP server that writes "bun!", `Bun.serve` serves about 2.5x more requests per second than node.js on Linux:

| Requests per second | Runtime |
| ------------------- | ------- |
| ~64,000             | Node 16 |
| ~160,000            | Bun     |

<sup>Bigger is better</sup>

<details>
<summary>Code</summary>

Bun:

```ts
Bun.serve({
  fetch(req: Request) {
    return new Response(`bun!`);
  },
  port: 3000,
});
```

Node:

```ts
require("http")
  .createServer((req, res) => res.end("bun!"))
  .listen(8080);
```

<img width="499" alt="image" src="https://user-images.githubusercontent.com/709451/162389032-fc302444-9d03-46be-ba87-c12bd8ce89a0.png">

</details>

#### Usage

Two ways to start an HTTP server with bun.js:

1. `export default` an object with a `fetch` function

If the file used to start bun has a default export with a `fetch` function, it will start the HTTP server.

```ts
// hi.js
export default {
  fetch(req) {
    return new Response("HI!");
  },
};

// bun ./hi.js
```

`fetch` receives a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object and must return either a [`Response` ](https://developer.mozilla.org/en-US/docs/Web/API/Response) or a [`Promise<Response>`](https://developer.mozilla.org/en-US/docs/Web/API/Response). In a future version, it might have additional arguments for things like cookies.

2. `Bun.serve` starts the HTTP server explicitly

```ts
Bun.serve({
  fetch(req) {
    return new Response("HI!");
  },
});
```

#### Error handling

For error handling, you get an `error` function.

If `development: true` and `error` is not defined or doesn't return a `Response`, you will get an exception page with a stack trace:

<img width="687" alt="image" src="https://user-images.githubusercontent.com/709451/162382958-23614e8f-239c-4ba6-be75-b76ceef8227c.png">

It will hopefully make it easier to debug issues with bun until bun gets debugger support. This error page is based on what `bun dev` does.

**If the error function returns a `Response`, it will be served instead**

```js
Bun.serve({
  fetch(req) {
    throw new Error("woops!");
  },
  error(error: Error) {
    return new Response("Uh oh!!\n" + error.toString(), { status: 500 });
  },
});
```

**If the `error` function itself throws and `development` is `false`, a generic 500 page will be shown**

To stop the server, call `server.stop()`:

```ts
const server = Bun.serve({
  fetch() {
    return new Response("HI!");
  },
});

server.stop();
```

The interface for `Bun.serve` is based on what [Cloudflare Workers](https://developers.cloudflare.com/workers/learning/migrating-to-module-workers/#module-workers-in-the-dashboard) does.

