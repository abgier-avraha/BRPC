import { Suspense } from "react";
import { SuspendedComponent } from "./_components/suspended-component";
import { createApi } from "./api";
import { Providers } from "./_components/providers";

export default async function Page() {
	const { api, hydration } = createApi();
	await api.echo({
		phrase: "test",
		date: new Date("1995-12-17T03:24:00"),
		nested: {
			arrayOfNumbers: [1, 2, 3, 4],
		},
	});

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<Providers hydration={hydration}>
				<Suspense fallback={<div>Loading...</div>}>
					<SuspendedComponent />
				</Suspense>
			</Providers>
		</div>
	);
}
