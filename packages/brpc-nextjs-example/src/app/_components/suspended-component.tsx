"use client";

import { useApi } from "../_hooks/use-api";

export const SuspendedComponent = async () => {
	const api = useApi();

	const { data } = api.echo.useSuspenseQuery({
		phrase: "",
		date: new Date(),
		nested: {
			arrayOfNumbers: [1],
		},
	});

	// const b = await a.mutateAsync({
	// 	phrase: "",
	// 	date: new Date(),
	// 	nested: {
	// 		arrayOfNumbers: [1]
	// 	}
	// });

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
