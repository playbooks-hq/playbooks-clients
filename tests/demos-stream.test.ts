import { execFileSync, spawn } from 'node:child_process';
import Fs from 'node:fs';
import Http from 'node:http';
import Os from 'node:os';
import Path from 'node:path';

jest.setTimeout(20000);

const repoRoot = process.cwd();
const viteBin = Path.join(repoRoot, 'node_modules/vite/bin/vite.js');
const cliEntry = Path.join(repoRoot, 'dist/index.cjs');
const packageJson = JSON.parse(Fs.readFileSync(Path.join(repoRoot, 'package.json'), 'utf8'));

const jsonApiResponse = attributes => ({
	data: {
		type: 'demo',
		id: 'demo-test',
		attributes,
	},
});

const writeSseEvent = (response, { event, data, id, retry }) => {
	if (event) response.write(`event: ${event}\n`);
	if (id) response.write(`id: ${id}\n`);
	if (retry) response.write(`retry: ${retry}\n`);

	const lines = String(data).split('\n');
	lines.forEach(line => response.write(`data: ${line}\n`));
	response.write('\n');
};

const startSseResponse = response => {
	response.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	});

	if (response.flushHeaders) response.flushHeaders();
};

describe('demo streaming commands', () => {
	let server;
	let baseUrl;
	let configPath;
	let tempDirectory;

	const runCli = ({ args, interruptWhenStdoutIncludes }: { args: string[]; interruptWhenStdoutIncludes?: string }) =>
		new Promise<{ code: number | null; signal: NodeJS.Signals | null; stdout: string; stderr: string }>((resolve, reject) => {
			const child = spawn(process.execPath, [cliEntry, ...args], {
				cwd: repoRoot,
				stdio: ['ignore', 'pipe', 'pipe'],
			});

			let stdout = '';
			let stderr = '';
			let interrupted = false;

			const timeout = setTimeout(() => {
				child.kill('SIGKILL');
				reject(new Error(`CLI timed out.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`));
			}, 8000);

			child.stdout.on('data', chunk => {
				stdout += chunk.toString();

				if (!interruptWhenStdoutIncludes || interrupted) return;
				if (!stdout.includes(interruptWhenStdoutIncludes)) return;

				interrupted = true;
				setTimeout(() => child.kill('SIGINT'), 50);
			});

			child.stderr.on('data', chunk => {
				stderr += chunk.toString();
			});

			child.on('error', error => {
				clearTimeout(timeout);
				reject(error);
			});

			child.on('exit', (code, signal) => {
				clearTimeout(timeout);
				resolve({ code, signal, stdout, stderr });
			});
		});

	beforeAll(async () => {
		server = Http.createServer((request, response) => {
			const url = new URL(request.url || '/', `http://${request.headers.host}`);

			if (url.pathname === '/demos/demo-test') {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify(jsonApiResponse({ status: 'running', subdomain: 'demo-test' })));
				return;
			}

			if (url.pathname === '/demos/demo-test/deploy') {
				response.writeHead(200, { 'Content-Type': 'application/json' });
				response.end(JSON.stringify(jsonApiResponse({ status: 'deploying', subdomain: 'demo-test' })));
				return;
			}

			if (url.pathname === '/demos/demo-test/health') {
				startSseResponse(response);
				writeSseEvent(response, { event: 'health', data: JSON.stringify({ status: 'starting' }) });

				const readyTimeout = setTimeout(() => {
					writeSseEvent(response, { event: 'health', id: '2', retry: 1000, data: JSON.stringify({ status: 'ready' }) });
				}, 40);

				const interval = setInterval(() => {
					writeSseEvent(response, { event: 'health', data: JSON.stringify({ status: 'ready' }) });
				}, 500);

				request.on('close', () => {
					clearTimeout(readyTimeout);
					clearInterval(interval);
				});

				return;
			}

			if (url.pathname === '/demos/demo-test/logs') {
				startSseResponse(response);
				writeSseEvent(response, { event: 'log', data: 'booting' });

				const readyTimeout = setTimeout(() => {
					writeSseEvent(response, { event: 'log', data: JSON.stringify({ line: 'server ready' }) });
				}, 40);

				const interval = setInterval(() => {
					writeSseEvent(response, { event: 'log', data: 'heartbeat' });
				}, 500);

				request.on('close', () => {
					clearTimeout(readyTimeout);
					clearInterval(interval);
				});

				return;
			}

			if (url.pathname === '/demos/broken/logs') {
				startSseResponse(response);
				writeSseEvent(response, { event: 'log', data: 'last line before disconnect' });
				setTimeout(() => response.end(), 40);
				return;
			}

			response.writeHead(404, { 'Content-Type': 'application/json' });
			response.end(JSON.stringify({ errors: [{ status: 404, title: 'Not Found', detail: 'Route not found.' }] }));
		});

		await new Promise<void>(resolve => {
			server.listen(0, '127.0.0.1', () => resolve());
		});

		const address = server.address();
		const port = typeof address === 'string' ? 80 : address.port;
		baseUrl = `http://127.0.0.1:${port}`;

		tempDirectory = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'playbooks-demos-'));
		configPath = Path.join(tempDirectory, 'playbooks-cli.config');
		Fs.writeFileSync(configPath, `latestVersion=${packageJson.version}\ntimestamp=${new Date().toJSON()}\n`);

		execFileSync(process.execPath, [viteBin, 'build', '--mode', 'development', '--minify', 'false'], {
			cwd: repoRoot,
			env: {
				...process.env,
				VITE_BASE_URL: baseUrl,
				VITE_CLI_DOMAIN: baseUrl,
			},
			maxBuffer: 1024 * 1024 * 10,
		});
	});

	afterAll(async () => {
		if (server) {
			await new Promise<void>(resolve => server.close(() => resolve()));
		}

		if (tempDirectory) {
			Fs.rmSync(tempDirectory, { recursive: true, force: true });
		}
	});

	it('keeps the demo detail command on the JSON request path', async () => {
		const result = await runCli({ args: ['demos', 'demo-test', '--config', configPath] });

		expect(result.code).toBe(0);
		expect(result.stdout).toContain('"status": "running"');
	});

	it('keeps the demo deploy command on the JSON request path', async () => {
		const result = await runCli({ args: ['demos', 'demo-test', 'deploy', '--config', configPath] });

		expect(result.code).toBe(0);
		expect(result.stdout).toContain('"status": "deploying"');
	});

	it('streams health events until the user exits', async () => {
		const result = await runCli({
			args: ['demos', 'demo-test', 'health', '--config', configPath],
			interruptWhenStdoutIncludes: '"status": "ready"',
		});

		expect(result.code).toBe(0);
		expect(result.stdout).toContain('[');
		expect(result.stdout).toContain('health');
		expect(result.stdout).toContain('"status": "ready"');
		expect(result.stdout).toContain('Stream closed.');
	});

	it('streams log events until the user exits', async () => {
		const result = await runCli({
			args: ['demos', 'demo-test', 'logs', '--config', configPath],
			interruptWhenStdoutIncludes: 'server ready',
		});

		expect(result.code).toBe(0);
		expect(result.stdout).toContain('booting');
		expect(result.stdout).toContain('"line": "server ready"');
		expect(result.stdout).toContain('Stream closed.');
	});

	it('exits non-zero when the stream disconnects unexpectedly', async () => {
		const result = await runCli({ args: ['demos', 'broken', 'logs', '--config', configPath] });

		expect(result.code).toBe(1);
		expect(result.stderr).toContain('"title": "StreamError"');
		expect(result.stderr).toContain('"detail": "Stream closed unexpectedly."');
	});
});
