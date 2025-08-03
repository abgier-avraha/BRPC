import fs from "node:fs";
import path from "node:path";
import { createChannel } from "brpc-client/src";
import { generateOpenApiSpec, startServer } from "brpc-server/src";
import fetch from "cross-fetch";
import superjson from "superjson";
import { expect, test } from "vitest";
import type { ApiType } from "./server";
import { testApi } from "./server";

test("Execute RPC from Client Channel", async () => {
	// Arrange
	const server = await startServer(testApi, 3000, superjson);
	const client = createChannel<ApiType>("http://localhost:3000", {
		middleware: [],
		serializer: superjson,
	});

	// Act
	const res = await client.echo({
		phrase: "Hello world!",
		date: new Date("2020-01-01T00:00:00.000Z"),
		nested: {
			arrayOfNumbers: [3, 2, 5],
		},
	});

	// Assert
	expect(res).toEqual({
		phrase: "Hello world!",
		date: new Date("2020-01-01T00:00:00.000Z"),
		nested: {
			arrayOfNumbers: [3, 2, 5],
		},
	});

	// Cleanup
	server.stop();
});

test("Execute RPC from Fetch", async () => {
	// Arrange
	const server = await startServer(testApi, 3001, superjson);

	// Act
	const req = {
		phrase: "Hello world!",
		date: new Date("2020-01-01T00:00:00.000Z"),
		nested: {
			arrayOfNumbers: [3, 2, 5],
		},
	};
	const serializedRequest = superjson.stringify(req);
	const response = await fetch("http://localhost:3001/echo", {
		method: "post",
		headers: {
			"content-type": "text/plain",
		},
		body: serializedRequest,
	});
	const rawResponse = await response.text();
	const parsedResponse = superjson.parse(rawResponse);

	// Assert
	expect(parsedResponse).toEqual({
		phrase: "Hello world!",
		date: new Date("2020-01-01T00:00:00.000Z"),
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
		fs.readFileSync(path.join(__dirname, "api.spec.snapshot.yml"), "utf8"),
	);
});
