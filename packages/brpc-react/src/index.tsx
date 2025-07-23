import type { HydrationState } from "brpc-client/src";
import type React from "react";
import { createContext, useContext, useState } from "react";

type Props = {
	state: HydrationState;
	children: React.ReactNode;
};

type HydrationContextType = {
	state: HydrationState;
	setState: (s: HydrationState) => void;
};

const HydrationContext = createContext<HydrationContextType>({
	state: {
		type: "hydration",
		data: {},
	},
	setState() {},
});

export const createHydrationState = () => ({
	type: "hydration" as const,
	data: {},
});

export function HydrationProvider(props: Props) {
	const [value, setValue] = useState<HydrationState>({
		type: "hydration",
		data: {},
	});

	return (
		<HydrationContext.Provider value={{ state: value, setState: setValue }}>
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

// TODO:
// 3. we need to pass hydration setter/getter to the trpc client
// 4. we need to check the cache key (how is it generated? path + args? timeout?)
// 5. we need to set the cache
// 6. we need a test
//    1. create a client on the server, pass the hydration state context into it
//    2. use the hydration wrapper, pass the same hydration state context into it
//    3. have a child component make the same request and check for a cache hit
//       1. easy to test if you just return the current time and the second res matches the first
