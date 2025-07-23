import express, { Request, Response } from "express";
import yaml from "yaml";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type Serializer =  {
    stringify: (obj: any) => string,
    parse: (string: string) => any,
  }

export function createApi<
  Context extends Object,
  Policies extends IPolicies<Context>,
  Api extends Record<
    string,
    Brpc<
      Api[keyof Api]["requestSchema"] extends z.Schema
        ? Api[keyof Api]["requestSchema"]
        : never,
      Api[keyof Api]["responseSchema"] extends z.Schema
        ? Api[keyof Api]["responseSchema"]
        : never,
      Context,
      Policies
    >
  >
>(
  rpcs: Api,
  _contextFetcher?: () => Context,
  _policies?: Partial<Policies>
): BrpcApi<Context, Partial<Policies>, Api> {
  const contextFetcher =
    _contextFetcher === undefined ? () => ({} as any) : _contextFetcher;
  const policies = _policies === undefined ? {} : _policies;
  return { api: rpcs, contextFetcher: contextFetcher, policies: policies };
}

export function startServer<
  Context extends Object,
  Policies extends IPolicies<Context>,
  T
>(brpcApi: BrpcApi<Context, Policies, T>, port = 3000, serializer: Serializer = JSON) {
  return new Promise<{ stop: () => Promise<void> }>((res) => {
    console.log("Initializing server...");
    const app = express();
    app.use(express.text());

    Object.keys(brpcApi.api as Object).forEach((key) => {
      app.post(`/${key}`, async (req, res) => {
        // Parse request
        const parsedRequest = serializer.parse(req.body);

        // Create context
        const context: Context = brpcApi.contextFetcher();

        // Get rpc
        const rpc = brpcApi.api[
          key as keyof BrpcApi<Context, Policies, T>["api"]
        ] as Brpc<z.Schema, z.Schema, Context, IPolicies<Context>>;

        // Pre middleware
        const { policies = [] } = rpc;
        const baseMiddleware = (brpcApi.policies["base"] ?? []).flat();
        const matchingMiddleware = [
          ...baseMiddleware,
          ...policies
            .map((policyKey) => brpcApi.policies[policyKey] ?? [])
            .flat(),
        ];

        for (const middleware of matchingMiddleware) {
          await middleware.pre(req, res, context);
          if (res.headersSent) {
            return;
          }
        }

        // Validate input
        z.object({}).parseAsync
        await rpc.requestSchema.parseAsync(parsedRequest);

        // Handle
        const apiHandlerResult = await rpc.handler(parsedRequest, context);

        // Validate output
        await rpc.responseSchema.parseAsync(apiHandlerResult);

        // Response
        const serializedResponse = serializer.stringify(apiHandlerResult);

        res.send(serializedResponse);

        // Post middleware
        for (const middleware of matchingMiddleware) {
          await middleware.post(req, res, context);
        }
      });
    });

    const server = app.listen(port, () => {
      console.log("Started 🅱️rpc server!");
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
  Policies extends IPolicies<Context>,
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
    ] as Brpc<any, any, Context, IPolicies<Context>>;
    const requestDTOName = `${capitalize(key)}Request`;
    const responseDTOName = `${capitalize(key)}Response`;

    output.paths[`/${key}`] = {
      post: {
        operationId: key,
        requestBody: {
          content: {
            "text/plain": {
              schema: {
                $ref: `#/components/schemas/${requestDTOName}`,
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
                  $ref: `#/components/schemas/${responseDTOName}`,
                },
              },
            },
          },
        },
      },
    };

    output.components.schemas = {
      ...output.components.schemas,
      ...zodToJsonSchema(rpc.requestSchema, `${requestDTOName}`).definitions,
      ...zodToJsonSchema(rpc.responseSchema, `${responseDTOName}`).definitions,
    };
  });

  return yaml.stringify(output);
}

export interface IMiddleware<Context extends Object> {
  pre: (req: Request, res: Response, ctx: Context) => Promise<void>;
  post: (req: Request, res: Response, ctx: Context) => Promise<void>;
}

export type IPolicies<Context extends Object> = {
  base: IMiddleware<Context>[];
  [key: string]: IMiddleware<Context>[];
};

export type BrpcApi<
  Context extends Object,
  Policies extends Partial<IPolicies<Context>>,
  T = Record<string, Brpc<any, any, Context, Policies>>
> = {
  api: T;
  contextFetcher: () => Context;
  policies: Partial<IPolicies<Context>>;
};

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
