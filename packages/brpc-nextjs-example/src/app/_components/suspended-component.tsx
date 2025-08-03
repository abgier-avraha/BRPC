"use client";

import { useApi } from "../_hooks/use-api";
import { useSuspenseQuery } from "@tanstack/react-query";

export const SuspendedComponent = () => {
	const api = useApi();

	const { data } = useSuspenseQuery({
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

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
