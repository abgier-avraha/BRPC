import { createChannel } from "brpc-client/src";
import { useHydration } from "brpc-react";
import superjson from "superjson";
import type { ApiType } from "../../../run-brpc-server";

export const useApi = () => {
	const frontendClient = createChannel<ApiType>("http://localhost:3001", {
		middleware: [],
		serializer: superjson,
		hydrationState: useHydration(),
	});

	return frontendClient;
};
