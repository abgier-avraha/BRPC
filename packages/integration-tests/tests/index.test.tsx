import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { createChannel } from "brpc-client/src";
import { createHydrationState, HydrationProvider } from "brpc-react/src";
import { generateOpenApiSpec, startServer } from "brpc-server/src";
import fetch from "cross-fetch";
import { Suspense, use } from "react";
import { renderToPipeableStream } from "react-dom/server.node";
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

test("Execute RPC from Client Channel with Hydration Cache", async () => {
	// Arrange
	const state = createHydrationState();
	const server = await startServer(testApi, 3003, superjson);
	const serverClient = createChannel<ApiType>("http://localhost:3003", {
		middleware: [],
		serializer: superjson,
		hydrationState: state,
		ssr: true,
	});

	const frontendClient = createChannel<ApiType>("http://localhost:3003", {
		middleware: [],
		serializer: superjson,
		hydrationState: state,
		ssr: false,
	});

	// Act
	const serverRes = await serverClient.currentTime({});
	const frontendRes = await frontendClient.currentTime({});

	// Assert
	expect(frontendRes).toEqual({
		date: serverRes.date,
	});

	// Cleanup
	server.stop();
});

test("Execute RPC from Client Channel with Hydration Context", async () => {
	// Arrange
	const state = createHydrationState();
	const server = await startServer(testApi, 3004, superjson);
	const serverClient = createChannel<ApiType>("http://localhost:3004", {
		middleware: [],
		serializer: superjson,
		hydrationState: state,
		ssr: true,
	});
	const frontendClient = createChannel<ApiType>("http://localhost:3004", {
		middleware: [],
		serializer: superjson,
		hydrationState: state,
	});

	// Act

	// Prefetch
	const expected = await serverClient.currentTime({});

	// Suspense component
	const SuspendedComponent = () => {
		const data = use(frontendClient.currentTime({}));
		return <div>{data.date.toISOString()}</div>;
	};

	// Parent component
	const content = await renderToHtmlString(
		<HydrationProvider state={state}>
			<Suspense fallback={null}>
				<SuspendedComponent />
			</Suspense>
		</HydrationProvider>,
	);

	// Assert
	expect(content).toEqual(
		`<!--$--><div>${expected.date.toISOString()}</div><!--/$-->`,
	);

	// Cleanup
	server.stop();
});

export function renderToHtmlString(jsx: React.ReactElement): Promise<string> {
	return new Promise((resolve, reject) => {
		const stream = new PassThrough();
		let html = "";

		const { pipe } = renderToPipeableStream(jsx, {
			onAllReady() {
				pipe(stream);
			},
			onError(err) {
				reject(err);
			},
		});

		stream.on("data", (chunk) => {
			html += chunk.toString();
		});

		stream.on("end", () => {
			resolve(html);
		});

		stream.on("error", (err) => {
			reject(err);
		});
	});
}
