---
title: bun:sqlite (SQLite3 module)
layout: ../../layouts/MainLayout.astro
---

`bun:sqlite` is a high-performance built-in [SQLite3](https://www.sqlite.org/) module for bun.js.

- Simple, synchronous API (synchronous _is_ faster)
- Transactions
- Binding named & positional parameters
- Prepared statements
- Automatic type conversions (`BLOB` becomes `Uint8Array`)
- toString() prints as SQL

Installation:

```sh
# there's nothing to install
# bun:sqlite is built-in to bun.js
```

Example:

```ts
import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");
db.run(
  "CREATE TABLE IF NOT EXISTS foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);
db.run("INSERT INTO foo (greeting) VALUES (?)", "Welcome to bun!");
db.run("INSERT INTO foo (greeting) VALUES (?)", "Hello World!");

// get the first row
db.query("SELECT * FROM foo").get();
// { id: 1, greeting: "Welcome to bun!" }

// get all rows
db.query("SELECT * FROM foo").all();
// [
//   { id: 1, greeting: "Welcome to bun!" },
//   { id: 2, greeting: "Hello World!" },
// ]

// get all rows matching a condition
db.query("SELECT * FROM foo WHERE greeting = ?").all("Welcome to bun!");
// [
//   { id: 1, greeting: "Welcome to bun!" },
// ]

// get first row matching a named condition
db.query("SELECT * FROM foo WHERE greeting = $greeting").get({
  $greeting: "Welcome to bun!",
});
// [
//   { id: 1, greeting: "Welcome to bun!" },
// ]
```

### bun:sqlite Benchmark

Database: [Northwind Traders](https://github.com/jpwhite3/northwind-SQLite3/blob/master/Northwind_large.sqlite.zip).

This benchmark can be run from [./bench/sqlite](./bench/sqlite).

Here are results from an M1 Pro (64GB) on macOS 12.3.1.

**SELECT \* FROM "Order"**

| Library            | Runtime     | ms/iter              |
| ------------------ | ----------- | -------------------- |
| bun:sqlite3        | Bun 0.0.83  | 14.31 (1x)           |
| better-sqlite3     | Node 18.0.0 | 40.81 (2.8x slower)  |
| deno.land/x/sqlite | Deno 1.21.2 | 125.96 (8.9x slower) |

**SELECT \* FROM "Product"**

| Library            | Runtime     | us/iter              |
| ------------------ | ----------- | -------------------- |
| bun:sqlite3        | Bun 0.0.83  | 33.85 (1x)           |
| better-sqlite3     | Node 18.0.0 | 121.09 (3.5x slower) |
| deno.land/x/sqlite | Deno 1.21.2 | 187.64 (8.9x slower) |

**SELECT \* FROM "OrderDetail"**

| Library            | Runtime     | ms/iter              |
| ------------------ | ----------- | -------------------- |
| bun:sqlite3        | Bun 0.0.83  | 146.92 (1x)          |
| better-sqlite3     | Node 18.0.0 | 875.73 (5.9x slower) |
| deno.land/x/sqlite | Deno 1.21.2 | 541.15 (3.6x slower) |

In screenshot form (which has a different sorting order)

<img width="738" alt="image" src="https://user-images.githubusercontent.com/709451/168459263-8cd51ca3-a924-41e9-908d-cf3478a3b7f3.png">

### Getting started with bun:sqlite

bun:sqlite's API is loosely based on [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3), though the implementation is different.

bun:sqlite has two classes:

- `class Database`
- `class Statement`

#### `Database`

Calling `new Database(filename)` opens or creates the SQLite database.

```ts
constructor(
      filename: string,
      options?:
        | number
        | {
            /**
             * Open the database as read-only (no write operations, no create).
             *
             * Equivalent to {@link constants.SQLITE_OPEN_READONLY}
             */
            readonly?: boolean;
            /**
             * Allow creating a new database
             *
             * Equivalent to {@link constants.SQLITE_OPEN_CREATE}
             */
            create?: boolean;
            /**
             * Open the database as read-write
             *
             * Equivalent to {@link constants.SQLITE_OPEN_READWRITE}
             */
            readwrite?: boolean;
          }
    );
```

To open or create a SQLite3 database:

```ts
import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite");
```

Open an in-memory database:

```ts
import { Database } from "bun:sqlite";

// all of these do the same thing
var db = new Database(":memory:");
var db = new Database();
var db = new Database("");
```

Open read-write and throw if the database doesn't exist:

```ts
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { readwrite: true });
```

Open read-only and throw if the database doesn't exist:

```ts
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { readonly: true });
```

Open read-write, don't throw if new file:

```ts
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { readonly: true, create: true });
```

Open a database from a `Uint8Array`:

```ts
import { Database } from "bun:sqlite";
import { readFileSync } from "fs";

// unlike passing a filepath, this will not persist any changes to disk
// it will be read-write but not persistent
const db = new Database(readFileSync("mydb.sqlite"));
```

Close a database:

```ts
var db = new Database();
db.close();
```

Note: `close()` is called automatically when the database is garbage collected. It is safe to call multiple times but has no effect after the first.

#### Database.prototype.query

`query(sql)` creates a `Statement` for the given SQL and caches it, but does not execute it.

```ts
class Database {
  query(sql: string): Statement;
}
```

`query` returns a `Statement` object.

It performs the same operation as `Database.prototype.prepare`, except:

- `query` caches the prepared statement in the `Database` object
- `query` doesn't bind parameters

This intended to make it easier for `bun:sqlite` to be fast by default. Calling `.prepare` compiles a SQLite query, which can take some time, so it's better to cache those a little.

You can bind parameters on any call to a statement.

```js
import { Database } from "bun:sqlite";

// generate some data
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);
db.run("INSERT INTO foo (greeting) VALUES ($greeting)", {
  $greeting: "Welcome to bun",
});

// get the query
const stmt = db.query("SELECT * FROM foo WHERE greeting = ?");

// run the query
stmt.all("Welcome to bun!");
stmt.get("Welcome to bun!");
stmt.run("Welcome to bun!");
```

#### Database.prototype.prepare

`prepare(sql)` creates a `Statement` for the given SQL, but does not execute it.

Unlike `query()`, this does not cache the compiled query.

```ts
import { Database } from "bun:sqlite";

// generate some data
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);

// compile the prepared statement
const stmt = db.prepare("SELECT * FROM foo WHERE bar = ?");

// run the prepared statement
stmt.all("baz");
```

Internally, this calls [`sqlite3_prepare_v3`](https://www.sqlite.org/c3ref/prepare.html).

#### Database.prototype.exec & Database.prototype.run

`exec` is for one-off executing a query which does not need to return anything.
`run` is an alias.

```ts
class Database {
  // exec is an alias for run
  exec(sql: string, ...params: ParamsType): void;
  run(sql: string, ...params: ParamsType): void;
}
```

This is useful for things like

Creating a table:

```ts
import { Database } from "bun:sqlite";

var db = new Database();
db.exec(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);
```

Inserting one row:

```ts
import { Database } from "bun:sqlite";

var db = new Database();
db.exec(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);

// insert one row
db.exec("INSERT INTO foo (greeting) VALUES ($greeting)", {
  $greeting: "Welcome to bun",
});
```

For queries which aren't intended to be run multiple times, it should be faster to use `exec()` than `prepare()` or `query()` because it doesn't create a `Statement` object.

Internally, this function calls [`sqlite3_prepare`](https://www.sqlite.org/c3ref/prepare.html), [`sqlite3_step`](https://www.sqlite.org/c3ref/step.html), and [`sqlite3_finalize`](https://www.sqlite.org/c3ref/finalize.html).

#### Database.prototype.transaction

Creates a function that always runs inside a transaction. When the function is invoked, it will begin a new transaction. When the function returns, the transaction will be committed. If an exception is thrown, the transaction will be rolled back (and the exception will propagate as usual).

```ts
// setup
import { Database } from "bun:sqlite";
const db = Database.open(":memory:");
db.exec(
  "CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, age INTEGER)"
);

const insert = db.prepare("INSERT INTO cats (name, age) VALUES ($name, $age)");
const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

insertMany([
  { $name: "Joey", $age: 2 },
  { $name: "Sally", $age: 4 },
  { $name: "Junior", $age: 1 },
]);
```

Transaction functions can be called from inside other transaction functions. When doing so, the inner transaction becomes a savepoint.

```ts
// setup
import { Database } from "bun:sqlite";
const db = Database.open(":memory:");
db.exec(
  "CREATE TABLE expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT, dollars INTEGER);"
);
db.exec(
  "CREATE TABLE cats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, age INTEGER)"
);
const newExpense = db.prepare(
  "INSERT INTO expenses (note, dollars) VALUES (?, ?)"
);
const insert = db.prepare("INSERT INTO cats (name, age) VALUES ($name, $age)");
const insertMany = db.transaction((cats) => {
  for (const cat of cats) insert.run(cat);
});

const adopt = db.transaction((cats) => {
  newExpense.run("adoption fees", 20);
  insertMany(cats); // nested transaction
});

adopt([
  { $name: "Joey", $age: 2 },
  { $name: "Sally", $age: 4 },
  { $name: "Junior", $age: 1 },
]);
```

Transactions also come with `deferred`, `immediate`, and `exclusive` versions.

```ts
insertMany(cats); // uses "BEGIN"
insertMany.deferred(cats); // uses "BEGIN DEFERRED"
insertMany.immediate(cats); // uses "BEGIN IMMEDIATE"
insertMany.exclusive(cats); // uses "BEGIN EXCLUSIVE"
```

Any arguments passed to the transaction function will be forwarded to the wrapped function, and any values returned from the wrapped function will be returned from the transaction function. The wrapped function will also have access to the same binding as the transaction function.

bun:sqlite's transaction implementation is based on [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#transactionfunction---function) (along with this section of the docs), so thanks to Joshua Wise and better-sqlite3 contributors.

#### Database.prototype.serialize

SQLite has a built-in way to [serialize](https://www.sqlite.org/c3ref/serialize.html) and [deserialize](https://www.sqlite.org/c3ref/deserialize.html) databases to and from memory.

`bun:sqlite` fully supports it:

```ts
var db = new Database();

// write some data
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);
db.run("INSERT INTO foo VALUES (?)", "Welcome to bun!");
db.run("INSERT INTO foo VALUES (?)", "Hello World!");

const copy = db.serialize();
// => Uint8Array

const db2 = new Database(copy);
db2.query("SELECT * FROM foo").all();
// => [
//   { id: 1, greeting: "Welcome to bun!" },
//   { id: 2, greeting: "Hello World!" },
// ]
```

`db.serialize()` returns a `Uint8Array` of the database.

Internally, it calls [`sqlite3_serialize`](https://www.sqlite.org/c3ref/serialize.html).

#### Database.prototype.loadExtension

`bun:sqlite` supports [SQLite extensions](https://www.sqlite.org/loadext.html).

To load a SQLite extension, call `Database.prototype.loadExtension(name)`:

```ts
import { Database } from "bun:sqlite";

var db = new Database();

db.loadExtension("myext");
```

If you're on macOS, you will need to first use a custom SQLite install (you can install with homebrew). By default, bun uses Apple's proprietary build of SQLite because it benchmarks about 50% faster. However, they disabled extension support, so you will need to have a custom build of SQLite to use extensions on macOS.

```ts
import { Database } from "bun:sqlite";

// on macOS, this must be run before any other calls to `Database`
// if called on linux, it will return true and do nothing
// on linux it will still check that a string was passed
Database.setCustomSQLite("/path/to/sqlite.dylib");

var db = new Database();

db.loadExtension("myext");
```

To install sqlite with homebrew:

```bash
brew install sqlite
```

#### Statement

`Statement` is a prepared statement. Use it to run queries that get results.

TLDR:

- [`Statement.all(...optionalParamsToBind)`](#statementall) returns all rows as an array of objects
- [`Statement.values(...optionalParamsToBind)`](#statementvalues) returns all rows as an array of arrays
- [`Statement.get(...optionalParamsToBind)`](#statementget) returns the first row as an object
- [`Statement.run(...optionalParamsToBind)`](#statementrun) runs the statement and returns nothing
- [`Statement.finalize()`](#statementfinalize) closes the statement
- [`Statement.toString()`](#statementtostring) prints the expanded SQL, including bound parameters
- `get Statement.columnNames` get the returned column names
- `get Statement.paramsCount` how many parameters are expected?

You can bind parameters on any call to a statement. Named parameters and positional parameters are supported. Bound parameters are remembered between calls and reset the next time you pass parameters to bind.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT)"
);
db.run("INSERT INTO foo VALUES (?)", "Welcome to bun!");
db.run("INSERT INTO foo VALUES (?)", "Hello World!");

// Statement object
var statement = db.query("SELECT * FROM foo");

// returns all the rows
statement.all();

// returns the first row
statement.get();

// runs the query, without returning anything
statement.run();
```

#### Statement.all

Calling `all()` on a `Statement` instance runs the query and returns the rows as an array of objects.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object
var statement = db.query("SELECT * FROM foo WHERE count = ?");

// return all the query results, binding 2 to the count parameter
statement.all(2);
// => [
//   { id: 1, greeting: "Welcome to bun!", count: 2 },
//   { id: 3, greeting: "Welcome to bun!!!!", count: 2 },
// ]
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and repeatedly calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) until it returns `SQLITE_DONE`.

#### Statement.values

Calling `values()` on a `Statement` instance runs the query and returns the rows as an array of arrays.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object
var statement = db.query("SELECT * FROM foo WHERE count = ?");

// return all the query results as an array of arrays, binding 2 to "count"
statement.values(2);
// => [
//   [ 1, "Welcome to bun!", 2 ],
//   [ 3, "Welcome to bun!!!!", 2 ],
// ]

// Statement object, but with named parameters
var statement = db.query("SELECT * FROM foo WHERE count = $count");

// return all the query results as an array of arrays, binding 2 to "count"
statement.values({ $count: 2 });
// => [
//   [ 1, "Welcome to bun!", 2 ],
//   [ 3, "Welcome to bun!!!!", 2 ],
// ]
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and repeatedly calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) until it returns `SQLITE_DONE`.

#### Statement.get

Calling `get()` on a `Statement` instance runs the query and returns the first result as an object.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object
var statement = db.query("SELECT * FROM foo WHERE count = ?");

// return the first row as an object, binding 2 to the count parameter
statement.get(2);
// => { id: 1, greeting: "Welcome to bun!", count: 2 }

// Statement object, but with named parameters
var statement = db.query("SELECT * FROM foo WHERE count = $count");

// return the first row as an object, binding 2 to the count parameter
statement.get({ $count: 2 });
// => { id: 1, greeting: "Welcome to bun!", count: 2 }
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) once. Stepping through all the rows is not necessary when you only want the first row.

#### Statement.run

Calling `run()` on a `Statement` instance runs the query and returns nothing.

This is useful if you want to repeatedly run a query, but don't care about the results.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object (TODO: use a better example query)
var statement = db.query("SELECT * FROM foo");

// run the query, returning nothing
statement.run();
```

Internally, this calls [`sqlite3_reset`](https://www.sqlite.org/capi3ref.html#sqlite3_reset) and calls [`sqlite3_step`](https://www.sqlite.org/capi3ref.html#sqlite3_step) once. Stepping through all the rows is not necessary when you don't care about the results.

#### Statement.finalize

This method finalizes the statement, freeing any resources associated with it.

After a statement has been finalized, it cannot be used for any further queries. Any attempt to run the statement will throw an error. Calling it multiple times will have no effect.

It is a good idea to finalize a statement when you are done with it, but the garbage collector will do it for you if you don't.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object
var statement = db.query("SELECT * FROM foo WHERE count = ?");

statement.finalize();

// this will throw
statement.run();
```

#### Statement.toString()

Calling `toString()` on a `Statement` instance prints the expanded SQL query. This is useful for debugging.

```ts
import { Database } from "bun:sqlite";

// setup
var db = new Database();
db.run(
  "CREATE TABLE foo (id INTEGER PRIMARY KEY AUTOINCREMENT, greeting TEXT, count INTEGER)"
);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Welcome to bun!", 2);
db.run("INSERT INTO foo (greeting, count) VALUES (?, ?)", "Hello World!", 0);
db.run(
  "INSERT INTO foo (greeting, count) VALUES (?, ?)",
  "Welcome to bun!!!!",
  2
);

// Statement object
const statement = db.query("SELECT * FROM foo WHERE count = ?");

console.log(statement.toString());
// => "SELECT * FROM foo WHERE count = NULL"

statement.run(2); // bind the param

console.log(statement.toString());
// => "SELECT * FROM foo WHERE count = 2"
```

Internally, this calls [`sqlite3_expanded_sql`](https://www.sqlite.org/capi3ref.html#sqlite3_expanded_sql).

#### Datatypes

| JavaScript type | SQLite type            |
| --------------- | ---------------------- |
| `string`        | `TEXT`                 |
| `number`        | `INTEGER` or `DECIMAL` |
| `boolean`       | `INTEGER` (1 or 0)     |
| `Uint8Array`    | `BLOB`                 |
| `Buffer`        | `BLOB`                 |
| `bigint`        | `INTEGER`              |
| `null`          | `NULL`                 |
