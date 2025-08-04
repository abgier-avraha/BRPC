"use client";

import { useEffect, useState } from "react";
import { useApi } from "../_hooks/use-api";
import z from "zod";
import { EchoRequestSchema } from "../../../run-brpc-server";

export const SuspendedComponent = (props: {
	initialRequest: z.infer<typeof EchoRequestSchema>;
}) => {
	const api = useApi();
	const [req, setReq] = useState(props.initialRequest);
	const { data } = api.echo.useSuspenseQuery(req);

	// Refetch example
	useEffect(() => {
		setTimeout(() => {
			setReq({
				phrase: "test updated",
				date: new Date("1996-12-17T03:24:00"),
				nested: {
					arrayOfNumbers: [1, 2, 3],
				},
			});
		}, 2000);
	}, []);

	return (
		<div>
			<p>{data.phrase}</p>
			<p>{data.nested.arrayOfNumbers.join(" ")}</p>
			<p>{data.date.toISOString()}</p>
		</div>
	);
};
