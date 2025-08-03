import {
	type QueryClient,
	type UseMutationOptions,
	type UseMutationResult,
	type UseQueryOptions,
	type UseQueryResult,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
	useQueryClient,
} from "@tanstack/react-query";
import type { BrpcClient } from "brpc-client/src";
import type { BrpcApi } from "brpc-server/src";
import type React from "react";
import { createContext, useContext } from "react";

type BrpcError = unknown;

type BrpcQueryClient<T extends BrpcApi<any, any>> = {
	// TODO: conditionally choose which properties can exist depending on mutation or query
	[K in keyof BrpcClient<T>]: {
		useSuspenseQuery: (
			req: Parameters<BrpcClient<T>[K]>[0],
			options?: UseSuspenseQueryOptions<
				Awaited<ReturnType<BrpcClient<T>[K]>>,
				BrpcError
			>,
		) => UseSuspenseQueryResult<Awaited<ReturnType<BrpcClient<T>[K]>>>;
		useQuery: (
			req: Parameters<BrpcClient<T>[K]>[0],
			options?: UseQueryOptions<
				Awaited<ReturnType<BrpcClient<T>[K]>>,
				BrpcError
			>,
		) => UseQueryResult<Awaited<ReturnType<BrpcClient<T>[K]>>>;
		useMutation: (
			options?: UseMutationOptions<Awaited<ReturnType<BrpcClient<T>[K]>>>,
		) => UseMutationResult<
			Awaited<ReturnType<BrpcClient<T>[K]>>,
			BrpcError,
			Parameters<BrpcClient<T>[K]>[0]
		>;
		exec: (
			req: Parameters<BrpcClient<T>[K]>[0],
		) => ReturnType<BrpcClient<T>[K]>;
	};
};

type BrpcProviderProps = {
	api: BrpcClient<any>;
	children: React.ReactNode;
};

const BrpcContext = createContext<BrpcQueryClient<any> | undefined>(undefined);

function createBrpcQueryClient<T extends BrpcApi<any, any>>(
	_api: BrpcClient<T>,
	_queryClient: QueryClient,
): BrpcQueryClient<T> {
	// TODO: function to take api and query and make BrpcQueryClient
	return {} as BrpcQueryClient<T>;
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
