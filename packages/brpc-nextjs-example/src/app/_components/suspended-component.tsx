"use client";

import { useHydration } from "brpc-react";
import { useApi } from "../_hooks/use-api";

export const SuspendedComponent = () => {
	const api = useApi();

	console.log(useHydration());
	const data = wrapPromise(api.currentTime({})).read();
	return <div>{data.date.toISOString()}</div>;
};
type Status = "pending" | "success" | "error";

interface SuspenseResource<T> {
	read(): T;
}

export function wrapPromise<T>(promise: Promise<T> | T): SuspenseResource<T> {
	let status: Status = "pending";
	let result: T;
	let error: unknown;

	if (!(promise instanceof Promise)) {
		return {
			read(): T {
				return promise;
			},
		};
	}

	const suspender = promise.then(
		(res) => {
			status = "success";
			result = res;
		},
		(err) => {
			status = "error";
			error = err;
		},
	);

	return {
		read(): T {
			if (status === "pending") {
				throw suspender;
			} else if (status === "error") {
				throw error;
			} else {
				// biome-ignore lint/style/noNonNullAssertion: runtime safe
				return result!;
			}
		},
	};
}
