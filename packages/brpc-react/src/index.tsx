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
import type React from "react";
import { createContext, useContext, useMemo } from "react";

type BrpcError = unknown;

type BrpcQueryClient<T extends BrpcApi<any, any>> = {
	[K in keyof BrpcClient<T>]: BrpcReactRpc<
		Parameters<BrpcClient<T>[K]>[0],
		ReturnType<BrpcClient<T>[K]>
	>;
};

// TODO: conditionally choose which properties can exist depending on mutation or query
type BrpcReactRpc<Params, Returns> = {
	useSuspenseQuery: (
		req: Params,
		options?: UseSuspenseQueryOptions<Awaited<Returns>, BrpcError>,
	) => UseSuspenseQueryResult<Awaited<Returns>>;
	useQuery: (
		req: Params,
		options?: UseQueryOptions<Awaited<Returns>, BrpcError>,
	) => UseQueryResult<Awaited<Returns>>;
	useMutation: (
		options?: UseMutationOptions<Awaited<Returns>>,
	) => UseMutationResult<Awaited<Returns>, BrpcError, Params>;
	exec: (req: Params) => Returns;
};

type BrpcProviderProps = {
	api: BrpcClient<any>;
	children: React.ReactNode;
};

const BrpcContext = createContext<BrpcQueryClient<any> | undefined>(undefined);

function createBrpcQueryClient<T extends BrpcApi<any, any>>(
	api: BrpcClient<T>,
	queryClient: QueryClient,
): BrpcQueryClient<T> {
	return new Proxy(new Object(), {
		get(
			target: Record<string, BrpcReactRpc<any, any>>,
			name: string,
		): BrpcReactRpc<any, any> {
			// Cache method functions on the proxy target
			if (!target[name]) {
				target[name] = {
					useSuspenseQuery: (
						req: any,
						options?: UseSuspenseQueryOptions<any, any>,
					) => {
						return useSuspenseQuery(
							{
								...options,
								queryKey: [JSON.stringify(req)],
								queryFn: () => api[name](req),
							},
							queryClient,
						);
					},
					useQuery: (req: any, options?: UseQueryOptions<any, any>) => {
						return useQuery(
							{
								...options,
								queryKey: [JSON.stringify(req)],
								queryFn: () => api[name](req),
							},
							queryClient,
						);
					},
					useMutation: (options?: UseMutationOptions<any>) => {
						return useMutation(
							{
								...options,
								mutationFn: (req) => api[name](req),
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
	const brpcQueryClient = createBrpcQueryClient(props.api, queryClient);

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
