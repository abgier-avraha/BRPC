import { z } from "zod";
import { createApi } from "../../server/src/index";

export type ApiType = typeof testApi;

type ServerContext = {};

const EchoRequestSchema = z.object({
  phrase: z.string(),
});

const EchoResponseSchema = z.string();

export const testApi = createApi({
  echo: {
    handler: async (
      req: z.infer<typeof EchoRequestSchema>,
      _ctx: ServerContext
    ) => req.phrase,
    requestSchema: EchoRequestSchema,
    responseSchema: EchoResponseSchema,
  },
});
