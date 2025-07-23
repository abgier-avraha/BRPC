import fetch from "cross-fetch";
import type { BrpcApi } from "../../server/src/index";

type Client<T extends BrpcApi<any, any>> = {
	[K in keyof T["api"]]: (
		req: Parameters<T["api"][K]["handler"]>[0],
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
	middleware?: IChannelMiddleware[],
	serializer: {
		stringify: (obj: any) => string;
		parse: (string: string) => any;
	} = JSON,
): Client<T> {
	return new Proxy(new Object(), {
		get(_target, name) {
			return async (req: any) => {
				// Form request
				const url = `${host}/${name.toString()}`;
				const headers = {};
				const serializedRequest = serializer.stringify(req);

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
				const parsedResponse = serializer.parse(rawResponse);

				const responseHeaders: Record<string, string> = {};
				response.headers.forEach((v, k) => {
					responseHeaders[k] = v;
				});

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

				return parsedResponse;
			};
		},
	}) as Client<T>;
}
