import { createChannel } from "brpc-client/src";
import { createHydrationState } from "brpc-react/src/hydration-state";
import type { ApiType } from "../../run-brpc-server";
import superjson from "superjson";

export function createApi() {
	const hydration = createHydrationState();

	const api = createChannel<ApiType>("http://localhost:3001", {
		middleware: [],
		serializer: superjson,
		hydrationSnapshot: hydration,
		dehydrate: true,
	});

	return { api, hydration };
}
