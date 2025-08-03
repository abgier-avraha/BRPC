import type { BrpcApi } from "brpc-server/src";
import fetch from "cross-fetch";

export type BrpcClient<T extends BrpcApi<any, any>> = {
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
	opts: {
		middleware?: IChannelMiddleware[];
		serializer?: {
			stringify: (obj: any) => string;
			parse: (string: string) => any;
		};
	},
): BrpcClient<T> {
	const { serializer = JSON, middleware = [] } = opts;

	return new Proxy(new Object(), {
		get(target: Record<string, (req: any) => any>, name: string) {
			// Cache method functions on the proxy target
			if (!target[name]) {
				target[name] = (req: any) => {
					const url = `${host}/${String(name)}`;
					const headers = {};
					const serializedRequest = serializer.stringify(req);

					return (async () => {
						if (middleware) {
							for (const m of middleware) {
								await m.pre({ body: serializedRequest, headers, url });
							}
						}

						const response = await makeRequest(url, headers, serializedRequest);

						if (middleware) {
							for (const m of middleware) {
								await m.post({
									body: response.raw,
									headers: response.headers,
									url,
								});
							}
						}

						return serializer.parse(response.raw);
					})();
				};
			}

			return target[name];
		},
	}) as BrpcClient<T>;
}

async function makeRequest(url: string, reqHeaders: {}, request: BodyInit) {
	const response = await fetch(url, {
		method: "post",
		headers: {
			...reqHeaders,
			"content-type": "text/plain",
		},
		body: request,
	});

	const raw = await response.text();

	const resHeaders: Record<string, string> = {};
	response.headers.forEach((v, k) => {
		resHeaders[k] = v;
	});

	return {
		raw,
		headers: resHeaders,
	};
}
