# 🅱️RPC

An experiment using Typescript's `import type` feature and ES proxies to achieve something like TRPC. Uses standard JSON serialization for Open API spec compatibility.

## Example

### Server

```ts
import { startServer, createApi } from "@brpc/server/index";
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

// Optional OpenAPI spec generation
fs.writeFileSync(
  path.join(__dirname, "api.spec.yml"),
  generateOpenApiSpec(api)
);
```

### Client

```ts
import { createChannel } from "@brpc/client/index";
// Important! Using `import type` prevents the server from from being bundled with the client
// `import type` declarations are erased during compilation and are only used for static analysis
import type { ApiType } from "../../server";

const client = createChannel<ApiType>("http://localhost:3000");
const res = await client.echo({ phrase: "Hello world!" });
```
