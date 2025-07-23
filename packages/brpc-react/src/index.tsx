"use client";

import type { HydrationState } from "brpc-client/src";
import type React from "react";
import { createContext, useContext } from "react";

type Props = {
	state: HydrationState;
	children: React.ReactNode;
};

const HydrationContext = createContext<HydrationState | undefined>(undefined);

export const createHydrationState = () => ({
	type: "hydration" as const,
	data: {},
});

export function HydrationProvider(props: Props) {
	return (
		<HydrationContext.Provider value={props.state}>
			{props.children}
		</HydrationContext.Provider>
	);
}

export function useHydration() {
	const context = useContext(HydrationContext);
	if (!context) {
		throw new Error("useHydration must be used within a HydrationProvider");
	}
	return context;
}
