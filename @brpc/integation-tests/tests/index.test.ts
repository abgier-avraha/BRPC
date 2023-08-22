import { expect, test } from "vitest";
import { getTestClient } from "./client";
import { startTestApi } from "./server";

test("Call server", async () => {
  // Arrange
  await startTestApi();
  const client = getTestClient();

  // Act
  const res = await client.echo({ phrase: "Hello world!" });

  // Assert
  expect(res).toBe("Hello world!");
});
