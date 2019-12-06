# graphql-testx

graphql-testx is a full-featured GraphQL server, based on Graphback and Apollo
Server. With the minimum configuration required, you have a server ready for
testing GraphQL client applications or libraries. Unlike mocking alternatives,
graphql-testx offers persistent data between queries and mutation using
in-memory SQLite database.

![graphql-testx](https://user-images.githubusercontent.com/7964685/69070551-9dc31980-0a28-11ea-8b55-97707b26693c.png)

## Getting Started

### Installation

Using npm:

```
npm install graphql-testx
```

or yarn:

```
yarn add graphql-testx
```

### Usage

```js
// create the server using a data model
const server = new TestxServer(`
  type Item {
    id: ID!
    name: String!
    author: String
  }`);

// start the server
await server.start();

// retrieve the server url
console.log(`Running on ${await server.httpUrl()}`);

// ...

// close the server once you finish otherwise it
// will not allow nodejs to exit
await server.close();
```

Under to hood we use Graphback to parse the Type Definitions/Data Model and
generate the GraphQL schema and resolvers. See the
[Graphback Docs on Data Model Definition](https://graphback.dev/docs/datamodel)

### Create the client

graphql-testx doesn't provide any graphql client, which means that you can use
the `server.httpUrl()` graphql endpoint with your preferred client or your own
developed client.

### What's next?

Going throw the [Examples](#examples) is the best way to start, we have
different examples that shows how to use **graphql-testx** using different
graphql clients and javascript test frameworks.

## Examples

- Testing **Apollo Client** library with **mocha**

  [graphql-testx-apollo-client-example](./examples/apollo-client)

- Testing **Offix** library with **Jest**

  [graphql-testx-offix-example](./examples/offix)

- Testing generic application with **Karma**

  [graphql-testx-karma-example](./example/karma)

## Contributing

Read our [contributing guide](CONTRIBUTING.md) if you're looking to contribute.

## Documentation

### `TestxServer`

Generate the GraphQL server form the given Data Model and provides a set of
useful methods. The database and the GraphQL resolvers are generated by
Graphback.

**Import**:

ES6 Modules:

```js
import { TestxServer } from "graphql-testx";
```

CommonJS:

```js
const { TestxServer } = require("graphql-testx");
```

**Usage**:

```js
const server = new TestxServer(`
  type Item {
    id: ID!
    name: String!
  }`);

await server.start();

console.log(`Running on ${await server.httpUrl()}`);

await server.close();
```

#### `bootstrap(): Promise<void>`

Generate the GraphQL server, the GraphQL resolvers, the client
queries/mutations/subscriptions and the database.

```js
// server: TestxServer
await server.bootstrap();
```

#### `start(): Promise<void>`

Start or re-start the GraphQL server.

```js
// server: TestxServer
await server.start();
```

If used without calling the `bootstrap()` method it will do it for you.

If used at the first time or after the `close()` method it will start the server
to a random port on localhost.

If used after the `stop()` method it will re-start the server on the previous
port.

If the server is already running it will return immediately.

#### `stop(): Promise<void>`

Stop the GraphQL server, so that it can be restarted on the same port, and also
preserve the database.

```js
// server: TestxServer
await server.start();
await server.stop();
await server.start(); // re-start
```

It is useful to test the client behavior when the GraphQL server is not
reachable.

If the server is not running it will return immediately.

#### `close(): Promise<void>`

Close the GraphQL server and the database.

```js
// server: TestxServer
await server.start();
await server.close();
```

#### `httpUrl(): Promise<string>`

Return the http url to the GraphQL server after starting the server.

```js
// server: TestxServer
await server.start();
console.log(`Running at ${await server.httUrl()}`);
```

### `wsUrl(): Promise<string>`

Return the websocket url to the GraphQL server after starting the server.

```js
// server: TestxServer
await server.start();
console.log(`Running at ${await server.wsUrl()}`);
```

The websocket url can be used to subscribe to the server like in this example:
[./examples/apollo-client/test/subscriptions.spec.ts](./examples/apollo-client/test/subscriptions.spec.ts)

#### `cleanDatabase(): Promise<string>`

Remove all data from the database.

```js
// server: TestxServer
await server.start();

// some mutations

await server.cleanDatabase();
```

It can be useful to reset the server state to a known point before each tests.

#### `setData(data: ImportData): Promise<void>`

Clean the database and insert the passed data directly to the database without
passing through GraphQL mutations.

```js
// server: TestxServer
await server.bootstrap();
await server.setData({
  item: [
    { id: 1, name: "one" },
    { id: 2, name: "two" }
  ]
});
```

It can be useful to reset the server to an initial state before each tests
without triggering subscriptions, or data business logics.

If you don't know the database structure you can use the `getDatabaseSchema()`
method.

#### `getGraphQlSchema(): Promise<string>`

Return the generated GraphQL schema.

```js
// server: TestxServer
await server.bootstrap();
console.log(await server.getGraphQlSchema());
```

```graphql
type Item {
  id: ID!
  name: String!
}

input ItemInput {
  name: String!
}

input ItemFilter {
  id: ID
  name: String
}

type Query {
  findItems(fields: ItemFilter!): [Item!]!
  findAllItems: [Item!]!
}

type Mutation {
  createItem(input: ItemInput!): Item!
  updateItem(id: ID!, input: ItemInput!): Item!
  deleteItem(id: ID!): ID!
}

type Subscription {
  newItem: Item!
  updatedItem: Item!
  deletedItem: ID!
}
```

#### `getDatabaseSchema(): Promise<{[table: string]: string[]}>`

Return the generated database schema.

```js
// server: TestxServer
await server.bootstrap();
console.log(await server.getDatabaseSchema());
```

```js
{
  item: ["id", "name", "created_at", "updated_at"];
}
```

#### `getQueries(): Promise<{[query: string]: string}>`

Return ready-to-use client queries.

```js
// server: TestxServer
await server.bootstrap();
console.log((await server.getQueries()).findAllItems);
```

```graphql
query findAllItems {
  findAllItems {
    ...ItemFields
  }
}

fragment ItemFields on Item {
  id
  name
}
```

#### `getMutations(): Promise<{[query: string]: string}>`

Return ready-to-use client mutations like for `getQueries()`.

#### `getSubscriptions(): Promise<{[query: string]: string}>`

Return ready-to-use client subscriptions like for `getQueries()`.
