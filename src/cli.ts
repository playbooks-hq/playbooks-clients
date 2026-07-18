import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export type PlaybooksCommandName =
	| 'account'
	| 'clone'
	| 'collections'
	| 'config'
	| 'download'
	| 'frameworks'
	| 'init'
	| 'languages'
	| 'login'
	| 'logout'
	| 'oauth'
	| 'ping'
	| 'plays'
	| 'platforms'
	| 'publish'
	| 'register'
	| 'session'
	| 'submit'
	| 'sync'
	| 'categories'
	| 'teams'
	| 'toggle'
	| 'tools'
	| 'users';

type Invocation = {
	command: string;
	args: string[];
	source: string;
};

type CommandOptions = Record<string, boolean | number | string | undefined>;

export type RunPlaybooksCommandInput = {
	command: PlaybooksCommandName;
	positional?: string[];
	options?: CommandOptions;
	configPath?: string;
	timeoutMs?: number;
};

type CommandResult = {
	ok: boolean;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	invocation: string;
};

type StructuredContent = NonNullable<CallToolResult['structuredContent']>;
type JsonParseResult = { ok: true; value: unknown } | { ok: false };
type PlaybooksError = {
	status: number;
	title: string;
	description: string;
	source?: string;
	debug?: string;
};

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_CONFIG_PATH = process.env.PLAYBOOKS_CONFIG ?? path.join(os.homedir(), '.playbooksrc');
const BOX_SIDE_PATTERN = /^[\s]*[│┃]/u;
const require = createRequire(import.meta.url);

async function fileExists(filePath: string) {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

function normalizeExecutable(candidate: string): Invocation {
	if (candidate.endsWith('.js') || candidate.endsWith('.mjs') || candidate.endsWith('.cjs')) {
		return {
			command: process.execPath,
			args: [candidate],
			source: candidate,
		};
	}

	return {
		command: candidate,
		args: [],
		source: candidate,
	};
}

export async function resolvePlaybooksCli() {
	try {
		const installedModuleEntry = require.resolve('@playbooks/cli');
		const installedBinEntry = path.join(path.dirname(installedModuleEntry), 'index.js');
		if (await fileExists(installedBinEntry)) {
			return normalizeExecutable(installedBinEntry);
		}
		return normalizeExecutable(installedModuleEntry);
	} catch {
		// Fall through to workspace or PATH resolution.
	}

	return normalizeExecutable('playbooks');
}

function stripAnsi(value: string) {
	return value.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI stripping requires control characters.
		/[\u001B\u009B][[\]()#;?]*(?:(?:(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*|[\dA-PR-TZcf-nq-uy=><~])?(?:\u0007|\u001B\\)|(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~])/g,
		'',
	);
}

function unwrapBoxOutput(value: string) {
	const lines = stripAnsi(value).replaceAll('\r\n', '\n').split('\n');
	if (!lines.some(line => BOX_SIDE_PATTERN.test(line))) {
		return lines.join('\n').trim();
	}

	const innerLines = lines
		.filter(line => BOX_SIDE_PATTERN.test(line))
		.map(line => {
			const trimmedStart = line.trimStart();
			const withoutLeftSide = trimmedStart.slice(1);
			const rightIndex = Math.max(withoutLeftSide.lastIndexOf('│'), withoutLeftSide.lastIndexOf('┃'));
			const candidate = rightIndex >= 0 ? withoutLeftSide.slice(0, rightIndex) : withoutLeftSide;
			return candidate.replace(/^ /, '').replace(/ $/, '');
		});

	return innerLines.join('\n').trim();
}

function formatInvocation(command: string, args: string[]) {
	return [command, ...args].map(fragment => (fragment.includes(' ') ? JSON.stringify(fragment) : fragment)).join(' ');
}

function parseJson(value: string): JsonParseResult {
	if (!value) {
		return { ok: false };
	}

	try {
		return { ok: true, value: JSON.parse(value) as unknown };
	} catch {
		return { ok: false };
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function structuredContent(value: unknown): StructuredContent {
	if (isRecord(value)) {
		return value;
	}

	return { data: value };
}

function textToolResult(text: string, isError = false): CallToolResult {
	return {
		content: [
			{
				type: 'text',
				text,
			},
		],
		isError,
	};
}

function jsonPayloadToolResult(value: unknown, isError = false): CallToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(value, null, 2),
			},
		],
		structuredContent: structuredContent(value),
		isError,
	};
}

function statusTitle(status: number) {
	switch (status) {
		case 400:
			return 'Bad Request';
		case 401:
			return 'Unauthorized';
		case 403:
			return 'Forbidden';
		case 404:
			return 'Not Found';
		case 422:
			return 'Unprocessable Entity';
		case 429:
			return 'Too Many Requests';
		case 502:
			return 'Bad Gateway';
		default:
			return status >= 500 ? 'Internal Server Error' : 'Error';
	}
}

function optionalString(value: unknown) {
	return typeof value === 'string' && value ? value : null;
}

function numberValue(value: unknown, fallback: number) {
	const number = typeof value === 'string' ? Number(value) : value;
	return typeof number === 'number' && Number.isFinite(number) ? number : fallback;
}

function debugString(value: unknown) {
	if (!value) {
		return null;
	}

	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(item => String(item)).join('\n');
	}

	return JSON.stringify(value);
}

function normalizeErrorData(value: unknown): PlaybooksError {
	if (isRecord(value)) {
		const status = numberValue(value.status, 500);
		const source = optionalString(value.source);
		const debug = optionalString(value.debug) ?? (!source ? debugString(value.source) : null);

		return {
			status,
			title: optionalString(value.title) ?? statusTitle(status),
			description:
				optionalString(value.description) ??
				optionalString(value.detail) ??
				optionalString(value.message) ??
				'Sorry, something went wrong.',
			...(source ? { source } : {}),
			...(debug ? { debug } : {}),
		};
	}

	return {
		status: 500,
		title: 'Internal Server Error',
		description: optionalString(value) ?? 'Sorry, something went wrong.',
	};
}

function errorEnvelope(value: unknown) {
	if (isRecord(value) && 'error' in value) {
		return { error: normalizeErrorData(value.error) };
	}

	if (isRecord(value) && Array.isArray(value.errors)) {
		return { error: normalizeErrorData(value.errors[0]) };
	}

	return { error: normalizeErrorData(value) };
}

function errorFromThrown(error: unknown) {
	if (isRecord(error)) {
		const status = numberValue(error.status, 500);
		const debug = process.env.NODE_ENV === 'development' ? optionalString(error.stack) : null;

		return {
			error: {
				status,
				title: optionalString(error.title) ?? statusTitle(status),
				description:
					optionalString(error.description) ?? optionalString(error.message) ?? 'Sorry, something went wrong.',
				...(debug ? { debug } : {}),
			},
		};
	}

	return errorEnvelope(error);
}

function buildArgs(input: RunPlaybooksCommandInput) {
	const args = [input.command, ...(input.positional ?? [])];
	const options = { machine: true, ...(input.options ?? {}) };

	if (input.configPath) {
		args.push('--config', input.configPath);
	}

	for (const [key, value] of Object.entries(options)) {
		if (value === undefined || value === false || (typeof value === 'string' && value === '')) {
			continue;
		}

		args.push(`--${key}`);

		if (value !== true) {
			args.push(String(value));
		}
	}

	return args;
}

async function runResolvedPlaybooks(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS): Promise<CommandResult> {
	const executable = await resolvePlaybooksCli();
	const invocationArgs = [...executable.args, ...args];

	return await new Promise((resolve, reject) => {
		const child = spawn(executable.command, invocationArgs, {
			cwd: process.cwd(),
			env: {
				...process.env,
				FORCE_COLOR: '0',
				NO_COLOR: '1',
			},
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';
		let completed = false;

		const timer = setTimeout(() => {
			if (completed) {
				return;
			}

			completed = true;
			child.kill('SIGTERM');
			reject(new Error(`The Playbooks CLI timed out after ${timeoutMs}ms.`));
		}, timeoutMs);

		child.stdout.on('data', chunk => {
			stdout += chunk.toString();
		});

		child.stderr.on('data', chunk => {
			stderr += chunk.toString();
		});

		child.on('error', error => {
			if (completed) {
				return;
			}

			completed = true;
			clearTimeout(timer);
			reject(error);
		});

		child.on('close', exitCode => {
			if (completed) {
				return;
			}

			completed = true;
			clearTimeout(timer);

			resolve({
				ok: exitCode === 0,
				exitCode,
				stdout: unwrapBoxOutput(stdout),
				stderr: stripAnsi(stderr).trim(),
				invocation: formatInvocation(executable.command, invocationArgs),
			});
		});
	});
}

export async function runPlaybooksRawArgs(args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
	return await runResolvedPlaybooks(args, timeoutMs);
}

export async function runPlaybooksCommand(input: RunPlaybooksCommandInput): Promise<CommandResult> {
	const timeoutMs = Number.isFinite(input.timeoutMs) ? input.timeoutMs! : DEFAULT_TIMEOUT_MS;
	return await runResolvedPlaybooks(buildArgs(input), timeoutMs);
}

export async function getPlaybooksStatus(configPath?: string) {
	const resolvedConfigPath = configPath ?? DEFAULT_CONFIG_PATH;
	const executable = await resolvePlaybooksCli();
	const versionResult = await runPlaybooksRawArgs(['--version'], 30000).catch(() => null);

	return {
		cliSource: executable.source,
		configPath: resolvedConfigPath,
		configExists: await fileExists(resolvedConfigPath),
		defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
		cliVersion: versionResult?.ok ? versionResult.stdout : null,
	};
}

export function commandResultToToolResult(result: CommandResult): CallToolResult {
	const parsedStdout = parseJson(result.stdout);
	if (parsedStdout.ok) {
		return result.ok
			? jsonPayloadToolResult(parsedStdout.value)
			: jsonPayloadToolResult(errorEnvelope(parsedStdout.value), true);
	}

	const parsedStderr = parseJson(result.stderr);
	if (parsedStderr.ok) {
		return jsonPayloadToolResult(errorEnvelope(parsedStderr.value), true);
	}

	if (!result.ok) {
		return jsonPayloadToolResult(
			errorEnvelope({
				status: 500,
				title: 'Internal Server Error',
				description:
					result.stderr || result.stdout || `The Playbooks CLI exited with code ${result.exitCode ?? 'unknown'}.`,
			}),
			true,
		);
	}

	const pieces = [
		`Invocation: ${result.invocation}`,
		result.stdout ? `Output:\n${result.stdout}` : '',
		result.stderr ? `Stderr:\n${result.stderr}` : '',
	]
		.filter(Boolean)
		.join('\n\n');

	return textToolResult(pieces || 'The Playbooks CLI completed without output.', !result.ok);
}

export function jsonToolResult(value: unknown): CallToolResult {
	return jsonPayloadToolResult(value);
}

export function errorToolResult(error: unknown): CallToolResult {
	return jsonPayloadToolResult(errorFromThrown(error), true);
}
