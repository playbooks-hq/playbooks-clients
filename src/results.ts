import { STATUS_CODES } from 'node:http';

import type { CallToolResult } from '@modelcontextprotocol/server';
import { z } from 'zod';

import { AdapterError, type CommandResult } from './cli.js';

export const errorSchema = z
	.object({
		status: z.number().int(),
		title: z.string(),
		description: z.string(),
		source: z.string().optional(),
		debug: z.string().optional(),
	})
	.passthrough();

export const envelopeSchema = z.union([
	z.object({ data: z.json(), meta: z.record(z.string(), z.json()).optional() }).passthrough(),
	z.object({ error: errorSchema }).passthrough(),
]);

export const jsonToolResult = (value: Record<string, unknown>, isError = false): CallToolResult => ({
	content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
	structuredContent: value,
	isError,
});

export const errorToolResult = (error: unknown): CallToolResult =>
	jsonToolResult(
		{
			error: {
				status: error instanceof AdapterError ? error.status : 500,
				title: STATUS_CODES[error instanceof AdapterError ? error.status : 500] ?? 'Request Canceled',
				description:
					error instanceof AdapterError ? error.message : 'The MCP adapter could not complete the operation.',
			},
		},
		true,
	);

const parse = (value: string): unknown => {
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export const commandResultToToolResult = (result: CommandResult): CallToolResult => {
	if (result.exitCode !== 0) {
		for (const text of [result.stderr, result.stdout]) {
			const parsed = z.object({ error: errorSchema }).passthrough().safeParse(parse(text));
			if (parsed.success) return jsonToolResult(parsed.data, true);
		}
		return errorToolResult(
			new AdapterError(502, 'The CLI failed without a valid error envelope. Inspect resource state before retrying.'),
		);
	}
	const parsed = envelopeSchema.safeParse(parse(result.stdout));
	if (!parsed.success)
		return errorToolResult(
			new AdapterError(502, 'The CLI returned an invalid JSON envelope. Inspect resource state before retrying.'),
		);
	return jsonToolResult(parsed.data, 'error' in parsed.data);
};
