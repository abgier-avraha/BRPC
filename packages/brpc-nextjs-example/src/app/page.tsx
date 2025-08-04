import { Suspense } from "react";
import { SuspendedComponent } from "./_components/suspended-component";
import { api } from "./api";
import { BrpcHydrationProvider } from "./_components/brpc-hydration-provider";

export default async function Page() {
	await api.echo.prefetchQuery({
		phrase: "",
		date: new Date("1995-12-17T03:24:00"),
		nested: {
			arrayOfNumbers: [1],
		},
	});

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<BrpcHydrationProvider>
				<Suspense fallback={<div>Loading...</div>}>
					<SuspendedComponent />
				</Suspense>
			</BrpcHydrationProvider>
		</div>
	);
}
