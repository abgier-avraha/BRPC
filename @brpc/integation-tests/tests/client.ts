import { createChannel } from "../../client/src";
import type { ApiType } from "./server";

export function getTestClient() {
  return createChannel<ApiType>("http://localhost:3000");
}
