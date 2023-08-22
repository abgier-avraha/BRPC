import fetch from "cross-fetch";

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

export function createChannel<T extends BrpcApi<any>>(host: string): Client<T> {
  return new Proxy(new Object(), {
    get(_target, name) {
      return (req: any) =>
        new Promise(async (res) => {
          console.log(`Sending request to ${host}/${name.toString()}`);
          console.log(req);
          // TODO: superjson serialisation
          const serializedRequest = JSON.stringify(req);
          const response = await fetch(`${host}/${name.toString()}`, {
            method: "post",
            headers: {
              "content-type": "text/plain",
            },
            body: serializedRequest,
          });
          const rawResponse = await response.text();
          // TODO: superjson parsing
          const parsedResponse = JSON.parse(rawResponse);
          console.log(`Received response`);
          console.log(parsedResponse);
          res(parsedResponse);
        });
    },
  }) as any;
}
