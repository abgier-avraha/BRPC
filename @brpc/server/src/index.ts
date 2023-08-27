import express from "express";
import { IncomingHttpHeaders } from "http";
import yaml from "yaml";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// TODO: policies arg, Map of policy names and middleware {default: IMiddleware[], customPolicy: IMiddleware[]}
// TODO: for middleware pass req, res callback, continue callback and context (res.status(404).send("text"))
export function createApi<
  Context extends Object,
  Policies extends IPolicies,
  Rpcs extends Record<
    string,
    Brpc<
      Rpcs[keyof Rpcs]["requestSchema"] extends z.Schema
        ? Rpcs[keyof Rpcs]["requestSchema"]
        : never,
      Rpcs[keyof Rpcs]["responseSchema"] extends z.Schema
        ? Rpcs[keyof Rpcs]["responseSchema"]
        : never,
      Context,
      Policies
    >
  >
>(
  rpcs: Rpcs,
  _contextFetcher?: () => Context,
  _policies?: Policies
): BrpcApi<Context, Policies, Rpcs> {
  const contextFetcher =
    _contextFetcher === undefined ? () => ({} as any) : _contextFetcher;
  const policies = _policies === undefined ? {} : _policies;
  return { api: rpcs, contextFetcher: contextFetcher, policies: policies };
}

export function startServer<
  Context extends Object,
  Policies extends IPolicies,
  T
>(brpcApi: BrpcApi<Context, Policies, T>, port = 3000) {
  return new Promise<{ stop: () => Promise<void> }>((res) => {
    console.log("Initializing server...");
    const app = express();
    app.use(express.text());

    Object.keys(brpcApi.api as Object).forEach((key) => {
      console.log(`Creating rpc: /${key}`);

      app.post(`/${key}`, async (req, res) => {
        console.log(`Executing rpc: /${key}`);

        // Parse request
        const parsedRequest = JSON.parse(req.body);
        console.log(parsedRequest);

        // TODO: create context
        const context: IContext = {
          url: req.url,
          headers: req.headers,
          body: req.body,
          ...brpcApi.contextFetcher(),
        };

        // Get rpc
        const rpc = brpcApi.api[
          key as keyof BrpcApi<Context, Policies, T>["api"]
        ] as Brpc<any, any, IContext, IPolicies>;

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

export function generateOpenApiSpec<
  Context extends Object,
  Policies extends IPolicies,
  T
>(brpcApi: BrpcApi<Context, Policies, T>) {
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

  Object.keys(brpcApi.api as Object).forEach((key) => {
    const rpc = brpcApi.api[
      key as keyof BrpcApi<Context, Policies, T>["api"]
    ] as Brpc<any, any, IContext, IPolicies>;
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

interface IMiddleware {
  // TODO:
}

type IPolicies = Record<string | "default", IMiddleware[]>;

interface IContext {
  url: string;
  headers: IncomingHttpHeaders;
  body: string;
}

export type BrpcApi<
  Context extends Object,
  Policies extends IPolicies,
  T = Record<string, Brpc<any, any, Context & IContext, Policies>>
> = {
  api: T;
  contextFetcher: () => Context;
  policies: IPolicies;
};

// TODO: grouping rpcs and applying middleware to groups
// Maybe just use decorators to annotate?
interface Brpc<
  ReqSchema extends z.Schema,
  ResSchema extends z.Schema,
  Context,
  Policies
> {
  handler: (
    req: z.infer<ReqSchema>,
    ctx: Context
  ) => Promise<z.infer<ResSchema>>;
  requestSchema: ReqSchema;
  responseSchema: ResSchema;
  policies?: Array<keyof Policies>;
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
