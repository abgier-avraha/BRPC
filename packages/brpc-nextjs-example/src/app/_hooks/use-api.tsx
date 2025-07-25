import { useBrpc } from "brpc-react";
import type { ApiType } from "../../../run-brpc-server";

export const useApi = () => {
	return useBrpc<ApiType>();
};
