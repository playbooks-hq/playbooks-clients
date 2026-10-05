import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { ToolDefinition } from 'src/tools/definition.js';

export class AdapterError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

export interface CommandResult {
	exitCode: number | null;
	stdout: string;
	stderr: string;
}

export const buildInvocation = (tool: ToolDefinition, input: Record<string, unknown>, config: string) => {
	const args = [...tool.command.split(' ')];
	if (tool.positional) args.push(String(input[tool.positional]));
	args.push('--json', `--config=${config}`);
	for (const [name, option] of Object.entries(tool.options)) {
		const value = input[name];
		if (value === undefined || name === tool.positional) continue;
		if (option.kind === 'boolean') {
			if (value === true) args.push(`--${option.flag}`);
		} else args.push(`--${option.flag}=${String(value)}`);
	}
	const stdin = input.data === undefined ? undefined : JSON.stringify(input.data);
	if (stdin !== undefined) {
		if (Buffer.byteLength(stdin) > 1024 * 1024) throw new AdapterError(422, 'Input exceeds 1 MiB.');
		args.push('--data=-');
	}
	return { args, stdin };
};

export const resolvePlaybooksCli = async () => {
	const requireCli = createRequire(import.meta.url);
	let directory: string;
	try {
		directory = path.dirname(requireCli.resolve('@playbooks/cli'));
	} catch {
		throw new AdapterError(503, 'Install the rewritten @playbooks/cli package before starting MCP.');
	}
	while (true) {
		const manifest = await readFile(path.join(directory, 'package.json'), 'utf8').catch(() => null);
		if (manifest) {
			const pkg = JSON.parse(manifest);
			if (pkg.name === '@playbooks/cli') {
				const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.playbooks;
				if (typeof bin !== 'string') break;
				const executable = path.resolve(directory, bin);
				if (!executable.startsWith(directory + path.sep)) break;
				await access(executable);
				return executable;
			}
		}
		const parent = path.dirname(directory);
		if (parent === directory) break;
		directory = parent;
	}
	throw new AdapterError(503, 'The installed CLI package does not declare a valid playbooks executable.');
};

export class CliRunner {
	private readonly active = new Set<{ stop: () => void; done: Promise<CommandResult> }>();
	private closed = false;
	constructor(
		private readonly executable: string,
		readonly config: string,
	) {}

	async verifyCompatibility(commands: string[]) {
		const result = await this.run(['--help']);
		const advertised = new Set(result.stdout.split('\n').map(line => line.trim().split(/\s{2,}/)[0]));
		if (
			result.exitCode !== 0 ||
			!result.stdout.includes('--json') ||
			!commands.every(command => advertised.has(command))
		) {
			throw new AdapterError(
				503,
				'The installed CLI is incompatible with the enabled tools. Install the complete Workspace/Project rewrite; the legacy 0.16.1 artifact is unsupported.',
			);
		}
	}

	execute(tool: ToolDefinition, input: Record<string, unknown>, signal?: AbortSignal) {
		const invocation = buildInvocation(tool, input, this.config);
		return this.run(invocation.args, invocation.stdin, signal);
	}

	async close() {
		this.closed = true;
		const active = [...this.active];
		for (const child of active) child.stop();
		await Promise.allSettled(active.map(child => child.done));
	}

	private run(args: string[], stdin?: string, signal?: AbortSignal): Promise<CommandResult> {
		if (this.closed || signal?.aborted)
			return Promise.reject(
				new AdapterError(499, 'CLI observation was canceled. Accepted remote work is not canceled.'),
			);
		const child = spawn(process.execPath, [this.executable, ...args], {
			shell: false,
			env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
			stdio: ['pipe', 'pipe', 'pipe'],
		});
		let failure: AdapterError | undefined;
		let escalation: ReturnType<typeof setTimeout> | undefined;
		let timer: ReturnType<typeof setTimeout>;
		const stop = (error: AdapterError) => {
			if (failure) return;
			failure = error;
			child.kill('SIGTERM');
			escalation = setTimeout(() => child.kill('SIGKILL'), 2000);
		};
		const cancel = () =>
			stop(
				new AdapterError(
					499,
					'CLI observation was canceled. Accepted remote work is not canceled. Inspect resource state before retrying.',
				),
			);
		const done = new Promise<CommandResult>((resolve, reject) => {
			const stdout: Buffer[] = [],
				stderr: Buffer[] = [];
			let bytes = 0;
			const collect = (target: Buffer[], chunk: Buffer) => {
				bytes += chunk.length;
				if (bytes > 8 * 1024 * 1024)
					stop(
						new AdapterError(
							502,
							'CLI output exceeded 8 MiB. Narrow the query or select fewer fields. Accepted remote work is not canceled.',
						),
					);
				else if (!failure) target.push(chunk);
			};
			child.stdout.on('data', chunk => collect(stdout, chunk));
			child.stderr.on('data', chunk => collect(stderr, chunk));
			child.on('error', () =>
				stop(new AdapterError(503, 'The Playbooks CLI could not start. Check the installed package and Node version.')),
			);
			child.stdin.on('error', error => {
				if ((error as NodeJS.ErrnoException).code !== 'EPIPE')
					stop(new AdapterError(502, 'The CLI input could not be delivered. Inspect resource state before retrying.'));
			});
			child.on('close', exitCode => {
				clearTimeout(timer);
				clearTimeout(escalation);
				signal?.removeEventListener('abort', cancel);
				if (failure) reject(failure);
				else
					resolve({
						exitCode,
						stdout: Buffer.concat(stdout).toString('utf8').trim(),
						stderr: Buffer.concat(stderr).toString('utf8').trim(),
					});
			});
			timer = setTimeout(
				() =>
					stop(
						new AdapterError(
							504,
							'The CLI exceeded 120 seconds. Accepted remote work may still be active. Inspect resource state before retrying.',
						),
					),
				120000,
			);
			signal?.addEventListener('abort', cancel, { once: true });
			if (signal?.aborted) cancel();
			child.stdin.end(stdin);
		});
		const operation = { stop: cancel, done };
		this.active.add(operation);
		void done.then(
			() => this.active.delete(operation),
			() => this.active.delete(operation),
		);
		return done;
	}
}
