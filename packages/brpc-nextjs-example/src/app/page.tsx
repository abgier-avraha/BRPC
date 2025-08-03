import { Suspense } from "react";
import { SuspendedComponent } from "./_components/suspended-component";
import { createApi } from "./api";
import { Providers } from "./_components/providers";
import { dehydrate } from "@tanstack/react-query";

export default async function Page() {
	const { queryClient, api } = createApi();
	await queryClient.prefetchQuery({
		queryKey: ["echo-random"],
		queryFn: () =>
			api.echo({
				phrase: "test",
				date: new Date("1995-12-17T03:24:00"),
				nested: {
					arrayOfNumbers: [1, 2, 3, 4],
				},
			}),
	});

	const dehydratedState = dehydrate(queryClient);

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<Providers state={dehydratedState}>
				<Suspense fallback={<div>Loading...</div>}>
					<SuspendedComponent />
				</Suspense>
			</Providers>
		</div>
	);
}
