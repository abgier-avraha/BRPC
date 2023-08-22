type BrpcApi<
  Context extends Object,
  T = Record<string, Brpc<any, any, Context>>
> = T;

interface Brpc<Req, Res, Context> {
  handle: (req: Req, ctx: Context) => Promise<Res>;
  // TODO: zod req and response schemas
  validate: (req: Req, ctx: Context) => boolean;
}

type Client<T extends BrpcApi<any>> = {
  [K in keyof T]: (
    req: Parameters<T[K]["handle"]>[0]
  ) => ReturnType<T[K]["handle"]>;
};

export function createChannel<T extends BrpcApi<any>>(): Client<T> {
  return new Proxy(new Object(), {
    get(target, name) {
      // TODO: serialise with superjson
      // TODO: generate request
      // TODO: execute and await request
      // TODO: parse response with superjson
      // TODO: return response
      // console.log(target);
      return (req: { phrase: string }) => req.phrase;
    },
  }) as any;
}
