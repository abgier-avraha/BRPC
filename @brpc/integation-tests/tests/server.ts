import { startServer, createApi } from "../../server/src";

export type ApiType = typeof api;

export function startTestApi() {
  startServer(api);
}

type ServerContext = {};

const api = createApi<ServerContext>({
  echo: {
    handle: async (req: { phrase: string }) => req.phrase,
    validate: (req: { phrase: string }) => true,
  },
});
