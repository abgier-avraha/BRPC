import { z } from "zod";
import { createApi } from "../../server/src/index";

export type ApiType = typeof testApi;

type ServerContext = {};

const EchoRequestSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
  nested: z.object({
    arrayOfNumbers: z.array(z.number()),
  }),
});

const EchoResponseSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
  nested: z.object({
    arrayOfNumbers: z.array(z.number()),
  }),
});

export const testApi = createApi(
  {
    echo: {
      handler: async (
        req: z.infer<typeof EchoRequestSchema>,
        _ctx: ServerContext
      ) => {
        return { phrase: req.phrase, date: req.date, nested: req.nested };
      },
      requestSchema: EchoRequestSchema,
      responseSchema: EchoResponseSchema,
    },
  },
  () => ({})
);
