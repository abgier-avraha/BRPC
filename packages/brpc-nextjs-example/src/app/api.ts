import { createChannel } from "brpc-client/src";
import { createHydrationState } from "brpc-react/src/hydration-state";
import type { ApiType } from "../../run-brpc-server";
import superjson from "superjson";

export const hydration = createHydrationState();

export const api = createChannel<ApiType>("http://localhost:3001", {
	middleware: [],
	serializer: superjson,
	hydrationState: hydration,
	ssr: true,
});
