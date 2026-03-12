import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export type PlaybooksCommandName =
	| 'account'
	| 'add'
	| 'banks'
	| 'cards'
	| 'charges'
	| 'clone'
	| 'download'
	| 'downloads'
	| 'login'
	| 'logout'
	| 'payouts'
	| 'ping'
	| 'play'
	| 'plays'
	| 'session'
	| 'subscription'
	| 'sync'
	| 'teams'
	| 'toggle'
	| 'transfers'
	| 'usage';

type Invocation = {
	command: string;
	args: string[];
	source: string;
};

type CommandOptions = Record<string, boolean | string | undefined>;

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

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.PLAYBOOKS_MCP_TIMEOUT_MS ?? '120000', 10);
const DEFAULT_CONFIG_PATH = process.env.PLAYBOOKS_CONFIG ?? path.join(os.homedir(), '.playbooksrc');
const BOX_SIDE_PATTERN = /^[\s]*[│┃]/u;

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
	const customPath = process.env.PLAYBOOKS_CLI_PATH;
	if (customPath) {
		const resolvedPath =
			customPath.includes(path.sep) || customPath.startsWith('.')
				? path.resolve(customPath)
				: customPath;
		return normalizeExecutable(resolvedPath);
	}

	const siblingDist = path.resolve(PACKAGE_ROOT, '../playbooks-cli/dist/index.js');
	if (await fileExists(siblingDist)) {
		return normalizeExecutable(siblingDist);
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

function buildArgs(input: RunPlaybooksCommandInput) {
	const args = [input.command, ...(input.positional ?? [])];

	if (input.configPath) {
		args.push('--config', input.configPath);
	}

	for (const [key, value] of Object.entries(input.options ?? {})) {
		if (value === undefined || value === false || value === '') {
			continue;
		}

		args.push(`--${key}`);

		if (value !== true) {
			args.push(value);
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
	const pieces = [
		`Invocation: ${result.invocation}`,
		result.stdout ? `Output:\n${result.stdout}` : '',
		result.stderr ? `Stderr:\n${result.stderr}` : '',
	]
		.filter(Boolean)
		.join('\n\n');

	return {
		content: [
			{
				type: 'text',
				text: pieces || 'The Playbooks CLI completed without output.',
			},
		],
		isError: !result.ok,
	};
}

export function jsonToolResult(value: unknown): CallToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(value, null, 2),
			},
		],
	};
}

export function errorToolResult(error: unknown): CallToolResult {
	const message = error instanceof Error ? error.message : String(error);

	return {
		content: [
			{
				type: 'text',
				text: message,
			},
		],
		isError: true,
	};
}
