import { z } from "zod";
import {
  createApi,
  generateOpenApiSpec,
  startServer,
} from "../../server/src/index";
const path = require("path");
const fs = require("fs");

export type ApiType = typeof api;

type ServerContext = {
  user: { subject: string };
};

const EchoRequestSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
});

const EchoResponseSchema = z.object({
  phrase: z.string(),
  date: z.string().datetime(),
});

export const api = createApi(
  {
    echo: {
      handler: async (
        req: z.infer<typeof EchoRequestSchema>,
        _ctx: ServerContext
      ) => {
        _ctx.user;
        return { phrase: req.phrase, date: req.date };
      },
      requestSchema: EchoRequestSchema,
      responseSchema: EchoResponseSchema,
      policies: ["customPolicy"],
    },
  },
  () => ({
    user: { subject: "11111" },
  }),
  {
    // TODO: create a logging middleware
    default: [],
    customPolicy: [],
  }
);

startServer(api);

fs.writeFileSync(
  path.join(__dirname, "api.spec.yml"),
  generateOpenApiSpec(api)
);
