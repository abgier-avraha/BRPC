import { expect, test } from "vitest";
import { getTestClient } from "./client";
import { startTestApi } from "./server";

test("Call server", async () => {
  // Arrange
  startTestApi();
  const client = getTestClient();

  // Act
  const res = await client.helloWorld({ phrase: "Hello world!" });

  // Assert
  expect(res).toBe("Hello world!");
});
