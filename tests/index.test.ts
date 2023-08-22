import { expect, test } from "vitest";
import { returns3 } from "../src/index";

test("returns 3", () => {
  expect(returns3()).toBe(3);
});
