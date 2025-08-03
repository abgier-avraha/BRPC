"use client";

import { createChannel } from "brpc-client/src";
import { BrpcProvider } from "brpc-react";
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

	return (
		<QueryClientProvider client={queryClient}>
			<BrpcProvider api={frontendClient}>{props.children}</BrpcProvider>
		</QueryClientProvider>
	);
}
