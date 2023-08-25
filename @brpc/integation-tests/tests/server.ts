import { z } from "zod";
import { createApi } from "../../server/src/index";

export type ApiType = typeof testApi;

type ServerContext = {};

const EchoRequestSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
});

const EchoResponseSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
});

export const testApi = createApi({
  echo: {
    handler: async (
      req: z.infer<typeof EchoRequestSchema>,
      _ctx: ServerContext
    ) => ({ phrase: req.phrase, date: req.date }),
    requestSchema: EchoRequestSchema,
    responseSchema: EchoResponseSchema,
  },
});
