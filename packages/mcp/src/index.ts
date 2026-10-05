import process from 'node:process';

import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { AdapterError, CliRunner, resolvePlaybooksCli } from 'src/cli.js';
import { parseOptions } from 'src/options.js';
import { createServer } from 'src/server.js';
import { selectTools } from 'src/tools/catalog.js';

async function main() {
	const options = parseOptions(process.argv.slice(2));
	if (options.help) {
		console.log(
			'Playbooks MCP\n\n--config <path>\n--toolsets <core,operator,discovery,templates,workspace,project,local|all>\n--read-only\n\nDefault toolsets: core,operator,discovery. Authenticate through playbooks login or PLAYBOOKS_TOKEN.',
		);
		return;
	}
	const runner = new CliRunner(await resolvePlaybooksCli(), options.config);
	const server = createServer(options, runner);
	const transport = new StdioServerTransport();
	let closing: Promise<void> | undefined;
	const close = () =>
		(closing ??= (async () => {
			await runner.close();
			await server.close();
		})());
	process.stdin.once('end', () => void close());
	process.stdin.once('close', () => void close());
	process.once('SIGINT', () => void close());
	process.once('SIGTERM', () => void close());
	server.server.onclose = () => {
		void runner.close();
	};
	try {
		await runner.verifyCompatibility(selectTools(options).map(tool => tool.command));
		if (!closing) await server.connect(transport);
	} catch (error) {
		await close();
		throw error;
	}
}

main().catch(error => {
	console.error(
		'playbooks-mcp failed to start:',
		error instanceof AdapterError
			? error.message
			: 'Check startup options, the installed CLI package, and Node version. Use --help for supported options.',
	);
	process.exitCode = 1;
});
