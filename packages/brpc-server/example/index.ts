import { z } from "zod";
import { type IMiddleware, createApi } from "../src/index";
import type { Request, Response } from "express";
import * as nanoid from "nanoid";

export type ApiType = typeof testApi;

class AuthorizationMiddleware implements IMiddleware<ServerContext> {
	async pre(req: Request, res: Response, ctx: ServerContext) {
		if (ctx.user === undefined) {
			console.log(`RPC: ${req.path} requires authorization`);
			res.sendStatus(401);
		}
	}
	async post(_req: Request, _res: Response, _ctx: ServerContext) {}
}

class LoggerMiddleware implements IMiddleware<ServerContext> {
	async pre(req: Request, res: Response, _ctx: ServerContext) {
		const traceId = nanoid.nanoid();
		console.log(`RPC: ${req.path} (${traceId}) executing...`);
		res.setHeader("x-brpc-trace", traceId);
		res.setHeader("x-brpc-start", performance.now());
	}
	async post(req: Request, res: Response, _ctx: ServerContext) {
		const traceId = res.getHeader("x-brpc-trace") as string;
		const start = res.getHeader("x-brpc-start") as number;
		const elapsed = performance.now() - start;
		console.log(
			`RPC: ${req.path} (${traceId}) completed after ${elapsed.toFixed(2)}ms`,
		);
	}
}

type ServerContext = {
	user: { subject: string };
};

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
				_ctx: ServerContext,
			) => {
				return { phrase: req.phrase, date: req.date, nested: req.nested };
			},
			requestSchema: EchoRequestSchema,
			responseSchema: EchoResponseSchema,
			policies: ["authorized"],
		},
	},
	() => ({
		user: {
			subject: "1",
		},
	}),
	{
		base: [new LoggerMiddleware()],
		authorized: [new AuthorizationMiddleware()],
	},
);
