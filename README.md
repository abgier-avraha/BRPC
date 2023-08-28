# 🅱️RPC

An experiment using Typescript's `import type` feature and ES proxies to achieve something like TRPC. Uses standard JSON serialization for Open API spec compatibility.

## Example

### Server

```ts
import { z } from "zod";
import { IMiddleware, createApi } from "../../server/src/index";

export type ApiType = typeof testApi;

type ServerContext = {};

const EchoRequestSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
  nested: z.object({
    arrayOfNumbers: z.array(z.number()),
  }),
});

const EchoResponseSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
  nested: z.object({
    arrayOfNumbers: z.array(z.number()),
  }),
});

export const testApi = createApi(
  // Rpcs
  {
    echo: {
      handler: async (
        req: z.infer<typeof EchoRequestSchema>,
        _ctx: ServerContext
      ) => {
        return { phrase: req.phrase, date: req.date, nested: req.nested };
      },
      requestSchema: EchoRequestSchema,
      responseSchema: EchoResponseSchema,
    },
  },
  // Server context fetcher
  () => ({}),
  {
    // Your policies
    base: [
      // Your middleware
    ],
  }
);

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
