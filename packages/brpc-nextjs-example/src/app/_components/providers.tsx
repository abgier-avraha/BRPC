"use client";

import { createChannel, type HydrationState } from "brpc-client/src";
import { BrpcProvider } from "brpc-react";
import { Suspense, useMemo } from "react";
import type { ApiType } from "../../../run-brpc-server";
import superjson from "superjson";

export function Providers(props: {
	children: React.ReactNode;
	hydration: HydrationState;
}) {
	const frontendClient = useMemo(() => {
		return createChannel<ApiType>("http://localhost:3001", {
			middleware: [],
			serializer: superjson,
			hydrationState: props.hydration,
		});
	}, [props.hydration]);

	return (
		<BrpcProvider api={frontendClient}>
			<Suspense fallback={<div>Loading...</div>}>{props.children}</Suspense>
		</BrpcProvider>
	);
}
