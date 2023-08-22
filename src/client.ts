import type { BrpcApi } from "./server";

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
      return `${target} ${name.toString()}`;
    },
  }) as any;
}
