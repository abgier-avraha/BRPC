const cache = new Map<string, any>();

export function useAsyncSuspense<T>(
	key: string,
	fetcher: () => Promise<T> | T,
): T {
	if (cache.has(key)) return cache.get(key);

	let status: "pending" | "success" | "error" = "pending";
	let result: T;
	let error: any;

	const res = fetcher();
	if (!(res instanceof Promise)) {
		return res;
	}

	const promise = Promise.resolve(res).then(
		(res) => {
			status = "success";
			result = res;
			cache.set(key, result);
		},
		(err) => {
			status = "error";
			error = err;
		},
	);
	if (status === "pending") throw promise;
	if (status === "error") throw error;

	// biome-ignore lint/style/noNonNullAssertion: runtime safe
	return result!;
}
