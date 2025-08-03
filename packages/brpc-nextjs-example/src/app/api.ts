import { createChannel } from "brpc-client/src";
import type { ApiType } from "../../run-brpc-server";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";

export function createApi() {
	const queryClient = new QueryClient();

	const api = createChannel<ApiType>("http://localhost:3001", {
		middleware: [],
		serializer: superjson,
	});

	return { api, queryClient };
}
