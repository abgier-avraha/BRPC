import { useMemo } from "react";

export function useAsyncSuspense<T>(
	fetcher: () => Promise<T> | T,
	dependencies: React.DependencyList,
): T {
	const resource = useMemo(() => {
		let status: "pending" | "success" | "error" = "pending";
		let result: T;
		let error: any;

		const value = fetcher();

		if (!(value instanceof Promise)) {
			// ✅ Sync value: skip suspense entirely
			status = "success";
			result = value;
			return {
				read(): T {
					return result;
				},
			};
		}

		// Async case: set up suspense-like behavior
		const promise = value.then(
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
				if (status === "pending") throw promise;
				if (status === "error") throw error;
				// biome-ignore lint/style/noNonNullAssertion: runtime safe
				return result!;
			},
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: runtime safe
	}, dependencies);

	return resource.read();
}
