#!/usr/bin/env node

import process from 'node:process';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
	const server = createServer();
	const transport = new StdioServerTransport();

	process.stdin.on('close', () => {
		void server.close();
	});

	await server.connect(transport);
}

main().catch(error => {
	console.error('playbooks-mcp failed to start:', error);
	process.exit(1);
});
