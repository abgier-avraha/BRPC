"use client";

import { useApi } from "../_hooks/use-api";

export const SuspendedComponent = () => {
	const api = useApi();

	const { data } = api.echo.useSuspenseQuery({
		phrase: "",
		date: new Date("1995-12-17T03:24:00"),
		nested: {
			arrayOfNumbers: [1],
		},
	});

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
