import { Suspense } from "react";
import { SuspendedComponent } from "./_components/suspended-component";
import { api } from "./api";

export default async function Page() {
	await api.echo({
		phrase: "test",
		date: new Date(),
		nested: {
			arrayOfNumbers: [1, 2, 3, 4],
		},
	});

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<Suspense fallback={<div>Loading...</div>}>
				<SuspendedComponent />
			</Suspense>
		</div>
	);
}
