"use client";

import { useApi } from "../_hooks/use-api";
import { useAsyncSuspense } from "../_hooks/use-async";

export const SuspendedComponent = () => {
	const api = useApi();
	// TODO: promise is failing then restarting
	const data = useAsyncSuspense(() => api.currentTime({}), []);

	return <div>{data.date.toISOString()}</div>;
};
