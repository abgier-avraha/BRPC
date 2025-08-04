import { ReactNode } from "react";
import { BrpcProviders } from "./brpc-providers";
import { dehydrate } from "@tanstack/react-query";
import { queryClient } from "../api";

export async function BrpcHydrationProvider(props: { children: ReactNode }) {
	const dehydratedState = dehydrate(queryClient);
	return (
		<BrpcProviders state={dehydratedState}>{props.children}</BrpcProviders>
	);
}
