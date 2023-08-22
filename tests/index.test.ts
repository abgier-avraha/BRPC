import { expect, test } from "vitest";
import { startServer, createApi } from "../src/server";
import { createChannel } from "../src/client";

type ServerContext = {};

test("Call server", async () => {
  // Arrange
  const api = createApi<ServerContext>({
    echo: {
      handle: async (req: { phrase: string }) => req.phrase,
      validate: (req: { phrase: string }) => true,
    },
  });
  startServer(api);
  const client = createChannel<typeof api>();

  // Act
  const res = await client.helloWorld({ phrase: "Hello world!" });

  // Assert
  // TODO:
});
