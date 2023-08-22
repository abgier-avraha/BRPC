# 🅱️RPC

An experiment using Typescript's `import type` feature, super JSON and proxies to achieve something like TRPC.

## Example

### Server

```ts
import { startServer, createApi } from "../../server/src/index";
import { z } from "zod";

export type ApiType = typeof api;

const RequestSchema = z.object({
  phrase: z.string(),
});

const ResponseSchema = z.string();

type ServerContext = {};

const api = createApi({
  echo: {
    handler: async (req: z.infer<typeof RequestSchema>, _ctx: ServerContext) =>
      req.phrase,
    requestSchema: RequestSchema,
    responseSchema: ResponseSchema,
  },
});

await startServer(api);
```

### Client

```ts
import { createChannel } from "../../client/src";
// Important! Using `import type` prevents the server from from being bundled with the client
// `import type` declarations are erased during compilation and are only used for static analysis
import type { ApiType } from "./server";

const client = createChannel<ApiType>("http://localhost:3000");
const res = await client.echo({ phrase: "Hello world!" });
```
