import {
	type QueryClient,
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryOptions,
	type UseQueryResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { BrpcClient } from "brpc-client/src";
import type { BrpcApi } from "brpc-server/src";
import stableStringify from "json-stable-stringify";
import { createContext, useContext } from "react";
import type { BrpcError } from "./index";

type BrpcQueryClient<T extends BrpcApi<any, any>> = {
	[K in keyof BrpcClient<T>]: BrpcQueryRpc<
		Parameters<BrpcClient<T>[K]>[0],
		ReturnType<BrpcClient<T>[K]>
	>;
};

// TODO: conditionally choose which properties can exist depending on mutation or query
type BrpcQueryRpc<Params, Returns> = {
	useSuspenseQuery: (
		req: Params,
		options?: MakeOptional<
			UseSuspenseQueryOptions<Awaited<Returns>, BrpcError>,
			"queryKey"
		>,
	) => UseSuspenseQueryResult<Awaited<Returns>>;
	useQuery: (
		req: Params,
		options?: MakeOptional<
			UseQueryOptions<Awaited<Returns>, BrpcError>,
			"queryKey"
		>,
	) => UseQueryResult<Awaited<Returns>>;
	useMutation: (
		options?: UseMutationOptions<Awaited<Returns>>,
	) => UseMutationResult<Awaited<Returns>, BrpcError, Params>;
	exec: (req: Params) => Returns;
};

export function createBrpcQueryClient<T extends BrpcApi<any, any>>(
	api: BrpcClient<T>,
	queryClient: QueryClient,
): BrpcQueryClient<T> {
	return new Proxy(new Object(), {
		get(
			target: Record<string, BrpcQueryRpc<any, any>>,
			name: string,
		): BrpcQueryRpc<any, any> {
			// Cache method functions on the proxy target
			if (!target[name]) {
				target[name] = {
					useSuspenseQuery: (
						req: any,
						options?: MakeOptional<
							UseSuspenseQueryOptions<any, any>,
							"queryKey"
						>,
					) => {
						return useSuspenseQuery(
							{
								queryKey: [stableStringify(req)],
								queryFn: () => api[name](req),
								...options,
							},
							queryClient,
						);
					},
					useQuery: (
						req: any,
						options?: MakeOptional<UseQueryOptions<any, any>, "queryKey">,
					) => {
						return useQuery(
							{
								queryKey: [stableStringify(req)],
								queryFn: () => api[name](req),
								...options,
							},
							queryClient,
						);
					},
					useMutation: (options?: UseMutationOptions<any>) => {
						return useMutation(
							{
								mutationFn: (req) => api[name](req),
								...options,
							},
							queryClient,
						);
					},
					exec: api[name],
				};
			}

			return target[name];
		},
	}) as BrpcQueryClient<T>;
}

export function BrpcReactProvider(props: BrpcProviderProps) {
	const queryClient = useQueryClient();
	const brpcQueryClient = createBrpcQueryClient(props.client, queryClient);

	return (
		<BrpcContext.Provider value={brpcQueryClient}>
			{props.children}
		</BrpcContext.Provider>
	);
}

export function useBrpc<T extends BrpcApi<any, any>>(): BrpcQueryClient<T> {
	const context = useContext(BrpcContext);
	if (!context) {
		throw new Error("useBrpc must be used within a BrpcProvider");
	}
	return context;
}

type BrpcProviderProps = {
	client: BrpcClient<any>;
	children: React.ReactNode;
};

const BrpcContext = createContext<BrpcQueryClient<any> | undefined>(undefined);

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
