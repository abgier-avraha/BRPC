import fetch from "cross-fetch";
import type { BrpcApi } from "../../server/src/index";

type Client<T extends BrpcApi<any, any>> = {
  [K in keyof T["api"]]: (
    req: Parameters<T["api"][K]["handler"]>[0]
  ) => ReturnType<T["api"][K]["handler"]>;
};

// TODO: middleware

export function createChannel<T extends BrpcApi<any, any>>(
  host: string
): Client<T> {
  return new Proxy(new Object(), {
    get(_target, name) {
      return (req: any) =>
        new Promise(async (res) => {
          console.log(`Sending request to ${host}/${name.toString()}`);
          console.log(req);
          const serializedRequest = JSON.stringify(req);
          const response = await fetch(`${host}/${name.toString()}`, {
            method: "post",
            headers: {
              "content-type": "text/plain",
            },
            body: serializedRequest,
          });
          const rawResponse = await response.text();
          const parsedResponse = JSON.parse(rawResponse);
          console.log(`Received response`);
          console.log(parsedResponse);
          res(parsedResponse);
        });
    },
  }) as any;
}
