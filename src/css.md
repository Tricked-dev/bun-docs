### CSS in JS

When importing CSS in JavaScript-like loaders, CSS is treated special.

By default, bun will transform a statement like this:

```js
import "../styles/global.css";
```

### CSS Loader

bun bundles `.css` files imported via `@import` into a single file. It doesn’t autoprefix or minify CSS today. Multiple `.css` files imported in one JavaScript file will _not_ be bundled into one file. You’ll have to import those from a `.css` file.

This input:

```css
@import url("./hi.css");
@import url("./hello.css");
@import url("./yo.css");
```

Becomes:

```css
/* hi.css */
/* ...contents of hi.css */
/* hello.css */
/* ...contents of hello.css */
/* yo.css */
/* ...contents of yo.css */
```

### CSS runtime

To support hot CSS reloading, bun inserts `@supports` annotations into CSS that tag which files a stylesheet is composed of. Browsers ignore this, so it doesn’t impact styles.

By default, bun’s runtime code automatically listens to `onimportcss` and will insert the `event.detail` into a `<link rel="stylesheet" href={${event.detail}}>` if there is no existing `link` tag with that stylesheet. That’s how bun’s equivalent of `style-loader` works.

