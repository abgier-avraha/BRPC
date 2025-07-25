"use client";

import { useApi } from "../_hooks/use-api";
import { useAsyncSuspense } from "../_hooks/use-async";

export const SuspendedComponent = () => {
	const api = useApi();
	// TODO: some sort of expiry time? serial args?
	const data = useAsyncSuspense("echo-random", () =>
		api.echo({
			phrase: "test",
			date: new Date(),
			nested: {
				arrayOfNumbers: [1, 2, 3, 4],
			},
		}),
	);

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			{/* TODO: Hydration mismatch */}
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
