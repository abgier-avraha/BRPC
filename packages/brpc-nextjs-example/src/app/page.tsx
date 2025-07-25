import { SuspendedComponent } from "./_components/suspended-component";
import { createChannel } from "brpc-client/src";
import { createHydrationState } from "brpc-react/src/hydration-state";
import superjson from "superjson";
import { Providers } from "./_components/providers";
import type { ApiType } from "../../run-brpc-server";

// TODO: move to util
export const hydration = createHydrationState();

const api = createChannel<ApiType>("http://localhost:3001", {
	middleware: [],
	serializer: superjson,
	hydrationState: hydration,
	ssr: true,
});

export default async function Page() {
	await api.currentTime({});

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			{/* TODO: move to layout */}
			<Providers hydration={hydration}>
				<SuspendedComponent />
			</Providers>
		</div>
	);
}
