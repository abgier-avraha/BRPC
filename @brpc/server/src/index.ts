import express from "express";

export function createApi<
  Context extends Object,
  T = {
    [key: string]: Brpc<any, any, Context>;
  }
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
        const parsedRequest = JSON.parse(req.body);
        console.log(parsedRequest);

        // TODO: create context
        const context = {};
        const apiHandlerResult = await api[
          key as keyof BrpcApi<Context, T>
        ].handle(parsedRequest, context);

        console.log("Sending response");
        console.log(apiHandlerResult);

        // TODO: superjson serialisation
        const serialisedResponse = JSON.stringify(apiHandlerResult);
        res.send(serialisedResponse);
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
interface Brpc<Req, Res, Context> {
  handle: (req: Req, ctx: Context) => Promise<Res>;
  // TODO: zod req and response schemas
  validate: (req: Req, ctx: Context) => boolean;
}
