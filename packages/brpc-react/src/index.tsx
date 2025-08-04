import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";
import type { BrpcClient } from "brpc-client/src";
import type { BrpcApi } from "brpc-server/src";
import stableStringify from "json-stable-stringify";

export type BrpcError = unknown;

type BrpcServerClient<T extends BrpcApi<any, any>> = {
	[K in keyof BrpcClient<T>]: BrpcServerRpc<
		Parameters<BrpcClient<T>[K]>[0],
		ReturnType<BrpcClient<T>[K]>
	>;
};

type BrpcServerRpc<Params, Returns> = {
	prefetchQuery: (
		req: Params,
		options?: FetchQueryOptions<Awaited<Returns>, BrpcError>,
	) => Promise<void>;
	exec: (req: Params) => Returns;
};

export function createBrpcServerClient<T extends BrpcApi<any, any>>(
	api: BrpcClient<T>,
	queryClient: QueryClient,
): BrpcServerClient<T> {
	return new Proxy(new Object(), {
		get(
			target: Record<string, BrpcServerRpc<any, any>>,
			name: string,
		): BrpcServerRpc<any, any> {
			// Cache method functions on the proxy target
			if (!target[name]) {
				target[name] = {
					prefetchQuery: async (
						req: any,
						options?: FetchQueryOptions<any, any>,
					) => {
						await queryClient.prefetchQuery({
							queryKey: [stableStringify(req)],
							queryFn: () => api[name](req),
							...options,
						});
					},
					exec: api[name],
				};
			}

			return target[name];
		},
	}) as BrpcServerClient<T>;
}
