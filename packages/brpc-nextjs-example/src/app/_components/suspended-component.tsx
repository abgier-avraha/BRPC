"use client";

import { suspend } from "brpc-client/src";
import { useApi } from "../_hooks/use-api";

export const SuspendedComponent = () => {
	const api = useApi();

	// TODO: some sort of expiry time? serial args?
	const data = suspend("echo-random", () =>
		api.echo({
			phrase: "test",
			date: new Date("1995-12-17T03:24:00"),
			nested: {
				arrayOfNumbers: [1, 2, 3, 4],
			},
		}),
	);

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
