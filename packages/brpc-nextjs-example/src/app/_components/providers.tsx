"use client";

import type { HydrationState } from "brpc-client/src";
import { HydrationProvider } from "brpc-react";
import { Suspense } from "react";

export function Providers(props: {
	hydration: HydrationState;
	children: React.ReactNode;
}) {
	return (
		<Suspense fallback={null}>
			<HydrationProvider state={props.hydration}>
				{props.children}
			</HydrationProvider>
		</Suspense>
	);
}
