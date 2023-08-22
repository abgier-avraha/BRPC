import { startServer, createApi } from "../../server/src/index";

export type ApiType = typeof api;

export async function startTestApi() {
  await startServer(api);
}

type ServerContext = {};

const rpcs = {
  echo: {
    handle: async (req: { phrase: string }) => req.phrase,
    validate: (req: { phrase: string }) => true,
  },
};

const api = createApi<ServerContext, typeof rpcs>(rpcs);
