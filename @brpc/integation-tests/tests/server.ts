import { startServer, createApi } from "../../server/src/index";

export type ApiType = typeof api;

export async function startTestApi() {
  await startServer(api);
}

type ServerContext = {};

const api = createApi({
  echo: {
    handle: async (req: { phrase: string }, _ctx: ServerContext) => req.phrase,
    validate: (_req: { phrase: string }) => true,
  },
});
