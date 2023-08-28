import fetch from "cross-fetch";
import type { BrpcApi } from "../../server/src/index";

type Client<T extends BrpcApi<any, any>> = {
  [K in keyof T["api"]]: (
    req: Parameters<T["api"][K]["handler"]>[0]
  ) => ReturnType<T["api"][K]["handler"]>;
};

export interface ChannelRequest {
  body: string;
  headers: Record<string, string>;
  url: string;
}
export interface ChannelResponse {
  body: string;
  headers: Record<string, string>;
  url: string;
}

interface IChannelMiddleware {
  pre: (req: ChannelRequest) => Promise<void>;
  post: (res: ChannelResponse) => Promise<void>;
}

export function createChannel<T extends BrpcApi<any, any>>(
  host: string,
  middleware?: IChannelMiddleware[]
): Client<T> {
  return new Proxy(new Object(), {
    get(_target, name) {
      return (req: any) =>
        new Promise(async (res) => {
          // Form request
          const url = `${host}/${name.toString()}`;
          let headers = {};
          const serializedRequest = JSON.stringify(req);

          // Execute pre middleware
          if (middleware !== undefined) {
            for (const middlewareItem of middleware) {
              await middlewareItem.pre({
                body: serializedRequest,
                headers: headers,
                url: url,
              });
            }
          }

          // Fetch response
          const response = await fetch(url, {
            method: "post",
            headers: {
              ...headers,
              "content-type": "text/plain",
            },
            body: serializedRequest,
          });

          // Parse response
          const rawResponse = await response.text();
          const parsedResponse = JSON.parse(rawResponse);

          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((v, k) => {
            responseHeaders[k] = v;
          });

          res(parsedResponse);

          // Execute post middleware
          if (middleware !== undefined) {
            for (const middlewareItem of middleware) {
              await middlewareItem.post({
                body: rawResponse,
                headers: responseHeaders,
                url: url,
              });
            }
          }
        });
    },
  }) as any;
}
