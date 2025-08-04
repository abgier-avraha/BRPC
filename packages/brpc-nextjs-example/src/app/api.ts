import { createChannel } from "brpc-client/src";
import type { ApiType } from "../../run-brpc-server";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import { createBrpcServerClient } from "brpc-react";

export const queryClient = new QueryClient();
export const brpcClient = createChannel<ApiType>("http://localhost:3001", {
	middleware: [],
	serializer: superjson,
});

export const api = createBrpcServerClient(brpcClient, queryClient);
