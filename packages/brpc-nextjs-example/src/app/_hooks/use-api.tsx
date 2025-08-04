import { useBrpc } from "brpc-react/src/use-brpc";
import type { ApiType } from "../../../run-brpc-server";

export const useApi = () => {
	return useBrpc<ApiType>();
};
