import express from "express";
import { z } from "zod";

export function createApi<
  Context extends Object,
  T extends Record<
    string,
    Brpc<
      z.Schema<Parameters<T[keyof T]["handle"]>[0]>,
      z.Schema<Awaited<ReturnType<T[keyof T]["handle"]>>>,
      Context
    >
  >
>(rpcs: T): BrpcApi<Context, T> {
  return rpcs;
}

export function startServer<Context extends Object, T>(
  api: BrpcApi<Context, T>
) {
  return new Promise<void>((res) => {
    console.log("Initializing server...");
    const app = express();
    app.use(express.text());

    Object.keys(api as Object).forEach((key) => {
      console.log(`Creating rpc: /${key}`);

      app.post(`/${key}`, async (req, res) => {
        console.log(`Executing rpc: /${key}`);
        // TODO: superjson parsing
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
        const apiHandlerResult = await rpc.handle(parsedRequest, context);

        // Validate output
        rpc.responseSchema.parse(apiHandlerResult);

        // Response
        console.log("Sending response");
        console.log(apiHandlerResult);

        // TODO: superjson serialisation
        const serializedResponse = JSON.stringify(apiHandlerResult);
        res.send(serializedResponse);
      });
    });

    app.listen(3000, () => {
      console.log("Started 🅱️ rpc server!");
      res();
    });
  });
}

type BrpcApi<
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
  handle: (
    req: z.infer<ReqSchema>,
    ctx: Context
  ) => Promise<z.infer<ResSchema>>;
  // TODO: zod req and response schemas
  requestSchema: ReqSchema;
  responseSchema: ResSchema;
}
