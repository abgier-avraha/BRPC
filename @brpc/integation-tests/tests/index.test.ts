import { expect, test } from "vitest";
import { getTestClient } from "./client";
import { testApi } from "./server";
import { generateOpenApiSpec, startServer } from "../../server/src";

test("Call server", async () => {
  // Arrange
  await startServer(testApi);
  const client = getTestClient();

  // Act
  const res = await client.echo({ phrase: "Hello world!" });

  // Assert
  expect(res).toBe("Hello world!");
  expect(generateOpenApiSpec(testApi)).toBe(
    JSON.stringify({
      openapi: "3.1.0",
      // TODO: configurable title and version
      info: { title: "BRPC OpenAPI 3.1", version: "1.0.0" },
      paths: {
        "/echo": {
          post: {
            operationId: "echo",
            requestBody: {
              content: {
                "text/plain": {
                  schema: { $ref: "#/components/schemas/echoRequest" },
                },
              },
              required: true,
            },
            responses: {
              "200": {
                content: {
                  "text/plain": {
                    schema: { $ref: "#/components/schemas/echoResponse" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          echoRequest: {
            type: "object",
            properties: { phrase: { type: "string" } },
            required: ["phrase"],
            additionalProperties: false,
          },
          echoResponse: { type: "string" },
        },
      },
    })
  );
});
