import { startServer, createApi } from "../../server/src/index";

export type ApiType = typeof api;
import { z } from "zod";

const RequestSchema = z.object({
  phrase: z.string(),
});

const ResponseSchema = z.string();

export async function startTestApi() {
  await startServer(api);
}

type ServerContext = {};

const api = createApi({
  echo: {
    handle: async (req: z.infer<typeof RequestSchema>, _ctx: ServerContext) =>
      req.phrase,
    requestSchema: RequestSchema,
    responseSchema: ResponseSchema,
  },
});
