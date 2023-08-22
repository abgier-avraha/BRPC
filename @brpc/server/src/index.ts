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
  // TODO: create server

  Object.keys(api as Object).forEach((_key) => {
    // api[key].handle
    // TODO: add routes
  });

  // TODO: start server
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
