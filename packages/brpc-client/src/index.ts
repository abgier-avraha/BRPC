import type { BrpcApi } from "brpc-server/src";
import fetch from "cross-fetch";

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

export type HydrationState = {
	type: "hydration";
	data: Record<
		string,
		{
			body: string;
			headers: Record<string, string>;
			date: Date;
		}
	>;
};

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
		ssr?: boolean;
		hydrationState?: HydrationState;
	},
): Client<T> {
	const {
		serializer = JSON,
		middleware = [],
		ssr = false,
		hydrationState,
	} = opts;
	if (ssr === true && !hydrationState) {
		throw new Error("SSR enabled but no hydration state provided to write to.");
	}

	return new Proxy(new Object(), {
		get(_target, name) {
			return async (req: any) => {
				// Form request
				const url = `${host}/${name.toString()}`;
				const headers = {};
				const serializedRequest = serializer.stringify(req);
				const cacheKey = `URL:${url}-REQ:${serializedRequest}`;

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
				const response = await makeRequestWithState(
					url,
					headers,
					serializedRequest,
					cacheKey,
					hydrationState,
					ssr,
				);

				// Parse response
				const parsedResponse = serializer.parse(response.raw);

				// Execute post middleware
				if (middleware !== undefined) {
					for (const middlewareItem of middleware) {
						await middlewareItem.post({
							body: response.raw,
							headers: response.headers,
							url: url,
						});
					}
				}

				return parsedResponse;
			};
		},
	}) as Client<T>;
}

async function makeRequestWithState(
	url: string,
	reqHeaders: {},
	request: BodyInit,
	cacheKey: string,
	state?: HydrationState,
	ssr?: boolean,
) {
	const cachedData = state?.data[cacheKey];

	// Lookup in cache
	if (cachedData !== undefined) {
		return {
			raw: cachedData.body,
			headers: cachedData.headers,
		};
	}

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

	if (ssr && state) {
		state.data = {
			[cacheKey]: {
				body: raw,
				headers: resHeaders,
				date: new Date(),
			},
		};
	}

	return {
		raw,
		headers: resHeaders,
	};
}
