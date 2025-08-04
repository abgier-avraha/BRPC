"use client";

import { createChannel } from "brpc-client/src";
import { BrpcReactProvider } from "brpc-react";
import { useMemo } from "react";
import type { ApiType } from "../../../run-brpc-server";
import superjson from "superjson";
import {
	DehydratedState,
	hydrate,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers(props: {
	children: React.ReactNode;
	state: DehydratedState;
}) {
	const frontendClient = useMemo(() => {
		return createChannel<ApiType>("http://localhost:3001", {
			middleware: [],
			serializer: superjson,
		});
	}, []);

	hydrate(queryClient, props.state);

	/* TODO:
		1. Every rpc can have a type param specifying either mutation or query
		2. Change BrpcProvider to BrpcReactProvider
			Get the query client with `useQueryClient`
			Wrap the brpc client with a brpcQueryClient which will create another Proxy
			That Proxy will leverage the query client and return the api channel with extra functions
			{
				useSuspenseQuery
				useQuery
				exec
			}
				OR 
			{
				useMutation
				exec
			}
			The query keys should auto populate and the only thing you need to worry about
			is passing the args
			ex: api.echo.useSuspenseQuery({phrase: "test"})
		3. Do a similar with proxies to provide `prefetchQuery` on the server
			The query keys should auto populate and the only thing you need to worry about
			is passing the args
			ex: await api.echo.prefetchQuery({phrase: "test"})
	*/

	return (
		<QueryClientProvider client={queryClient}>
			<BrpcReactProvider api={frontendClient}>
				{props.children}
			</BrpcReactProvider>
		</QueryClientProvider>
	);
}
