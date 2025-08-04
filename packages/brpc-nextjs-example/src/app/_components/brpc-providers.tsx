"use client";

import { BrpcReactProvider } from "brpc-react/src/use-brpc";
import {
	DehydratedState,
	hydrate,
	QueryClientProvider,
} from "@tanstack/react-query";
import { brpcClient, queryClient } from "../api";

export function BrpcProviders(props: {
	children: React.ReactNode;
	state: DehydratedState;
}) {
	hydrate(queryClient, props.state);

	/* TODO:
		Every rpc can have a type param specifying either mutation or query
	*/

	return (
		<QueryClientProvider client={queryClient}>
			<BrpcReactProvider client={brpcClient}>
				{props.children}
			</BrpcReactProvider>
		</QueryClientProvider>
	);
}
