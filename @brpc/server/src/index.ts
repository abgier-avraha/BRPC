import express from "express";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import yaml from "yaml";

export function createApi<
  Context extends Object,
  T extends Record<
    string,
    Brpc<
      T[keyof T]["requestSchema"] extends z.Schema
        ? T[keyof T]["requestSchema"]
        : never,
      T[keyof T]["responseSchema"] extends z.Schema
        ? T[keyof T]["responseSchema"]
        : never,
      Context
    >
  >
>(rpcs: T): BrpcApi<Context, T> {
  return rpcs;
}

export function startServer<Context extends Object, T>(
  api: BrpcApi<Context, T>,
  port = 3000
) {
  return new Promise<{ stop: () => Promise<void> }>((res) => {
    console.log("Initializing server...");
    const app = express();
    app.use(express.text());

    Object.keys(api as Object).forEach((key) => {
      console.log(`Creating rpc: /${key}`);

      app.post(`/${key}`, async (req, res) => {
        console.log(`Executing rpc: /${key}`);

        // Parse request
        const parsedRequest = JSON.parse(req.body);
        console.log(parsedRequest);

        // TODO: create context
        const context = {};

        // Get rpc
        const rpc = api[key as keyof BrpcApi<Context, T>] as Brpc<
          any,
          any,
          any
        >;

        // Validate input
        rpc.requestSchema.parse(parsedRequest);

        // Handle
        const apiHandlerResult = await rpc.handler(parsedRequest, context);

        // Validate output
        rpc.responseSchema.parse(apiHandlerResult);

        // Response
        console.log("Sending response");
        console.log(apiHandlerResult);

        const serializedResponse = JSON.stringify(apiHandlerResult);

        res.send(serializedResponse);
      });
    });

    const server = app.listen(port, () => {
      console.log("Started 🅱️ rpc server!");
      res({
        stop: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}

export function generateOpenApiSpec<Context extends Object, T>(
  api: BrpcApi<Context, T>
) {
  let output: any = {
    openapi: "3.1.0",
    info: {
      title: "BRPC OpenAPI 3.1",
      version: "1.0.0",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  Object.keys(api as Object).forEach((key) => {
    const rpc = api[key as keyof BrpcApi<Context, T>] as Brpc<any, any, any>;
    const requestName = `${capitalize(key)}Request`;
    const responseName = `${capitalize(key)}Response`;

    output.paths[`/${key}`] = {
      post: {
        operationId: key,
        requestBody: {
          content: {
            "text/plain": {
              schema: {
                $ref: `#/components/schemas/${requestName}`,
              },
            },
          },
          required: true,
        },
        responses: {
          "200": {
            content: {
              "text/plain": {
                schema: {
                  $ref: `#/components/schemas/${responseName}`,
                },
              },
            },
          },
        },
      },
    };

    output.components.schemas = {
      ...output.components.schemas,
      ...zodToJsonSchema(rpc.requestSchema, `${requestName}`).definitions,
    };
    output.components.schemas = {
      ...output.components.schemas,
      ...zodToJsonSchema(rpc.responseSchema, `${responseName}`).definitions,
    };
  });

  return yaml.stringify(output);
}

export type BrpcApi<
  Context extends Object,
  T = Record<string, Brpc<any, any, Context>>
> = T;

// TODO: grouping rpcs and applying middleware to groups
// Maybe just use decorators to annotate?
interface Brpc<
  ReqSchema extends z.Schema,
  ResSchema extends z.Schema,
  Context
> {
  handler: (
    req: z.infer<ReqSchema>,
    ctx: Context
  ) => Promise<z.infer<ResSchema>>;
  requestSchema: ReqSchema;
  responseSchema: ResSchema;
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
