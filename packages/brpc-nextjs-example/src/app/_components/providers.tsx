"use client";

import { createChannel, type HydrationSnapshot } from "brpc-client/src";
import { BrpcProvider } from "brpc-react";
import { useMemo } from "react";
import type { ApiType } from "../../../run-brpc-server";
import superjson from "superjson";

export function Providers(props: {
	children: React.ReactNode;
	hydrationSnapshot: HydrationSnapshot;
}) {
	const frontendClient = useMemo(() => {
		return createChannel<ApiType>("http://localhost:3001", {
			middleware: [],
			serializer: superjson,
			hydrationSnapshot: props.hydrationSnapshot,
		});
	}, [props.hydrationSnapshot]);

	return <BrpcProvider api={frontendClient}>{props.children}</BrpcProvider>;
}
