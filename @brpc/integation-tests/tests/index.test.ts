import { expect, test } from "vitest";
import type { ApiType } from "./server";
import { testApi } from "./server";
import { generateOpenApiSpec, startServer } from "../../server/src";
import { createChannel } from "../../client/src";
import fetch from "cross-fetch";
const fs = require("fs");
const path = require("path");

test("Execute RPC from Client Channel", async () => {
  // Arrange
  const server = await startServer(testApi);
  const client = createChannel<ApiType>("http://localhost:3000");

  // Act
  const res = await client.echo({
    phrase: "Hello world!",
    date: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    nested: {
      arrayOfNumbers: [3, 2, 5],
    },
  });

  // Assert
  expect(res).toEqual({
    phrase: "Hello world!",
    date: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    nested: {
      arrayOfNumbers: [3, 2, 5],
    },
  });

  // Cleanup
  server.stop();
});

test("Execute RPC from Fetch", async () => {
  // Arrange
  const server = await startServer(testApi, 3001);

  // Act
  const req = {
    phrase: "Hello world!",
    date: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    nested: {
      arrayOfNumbers: [3, 2, 5],
    },
  };
  const serializedRequest = JSON.stringify(req);
  const response = await fetch("http://localhost:3001/echo", {
    method: "post",
    headers: {
      "content-type": "text/plain",
    },
    body: serializedRequest,
  });
  const rawResponse = await response.text();
  const parsedResponse = JSON.parse(rawResponse);

  // Assert
  expect(parsedResponse).toEqual({
    phrase: "Hello world!",
    date: new Date("2020-01-01T00:00:00.000Z").toISOString(),
    nested: {
      arrayOfNumbers: [3, 2, 5],
    },
  });

  // Cleanup
  server.stop();
});

test("Generate OpenAPI Spec", async () => {
  // Assert
  expect(generateOpenApiSpec(testApi)).toBe(
    fs.readFileSync(path.join(__dirname, "api.spec.snapshot.yml"), "utf8")
  );
});
