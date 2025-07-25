import type { BrpcClient } from "brpc-client/src";

import type React from "react";
import { createContext, useContext } from "react";
import type { BrpcApi } from "brpc-server/src";

type BrpcProviderProps = {
	api: BrpcClient<any>;
	children: React.ReactNode;
};

const BrpcContext = createContext<BrpcClient<any> | undefined>(undefined);

export function BrpcProvider(props: BrpcProviderProps) {
	return (
		<BrpcContext.Provider value={props.api}>
			{props.children}
		</BrpcContext.Provider>
	);
}

export function useBrpc<T extends BrpcApi<any, any>>(): BrpcClient<T> {
	const context = useContext(BrpcContext);
	if (!context) {
		throw new Error("useBrpc must be used within a BrpcProvider");
	}
	return context;
}
