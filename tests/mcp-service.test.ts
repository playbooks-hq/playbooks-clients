import Path from 'node:path';

import {
	McpService,
	createPlaybooksMcpServerConfig,
	getClaudeConfigPath,
	getCodexConfigPath,
	getCursorConfigPath,
	getVscodeConfigPath,
	mergeCodexConfig,
	mergeJsonMcpConfig,
	mergeVscodeConfig,
} from 'src/services/mcp-service';
import { checkOrCreatePath, readFile, removePath, writeFile } from 'src/utils/fs';

describe('createPlaybooksMcpServerConfig', () => {
	it('formats the default npx launcher for non-Windows platforms', () => {
		expect(createPlaybooksMcpServerConfig('darwin')).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '@playbooks/mcp'],
		});
	});

	it('formats the cmd launcher for Windows platforms', () => {
		expect(createPlaybooksMcpServerConfig('win32')).toEqual({
			type: 'stdio',
			command: 'cmd',
			args: ['/c', 'npx', '-y', '@playbooks/mcp'],
		});
	});
});

describe('getClaudeConfigPath', () => {
	it('resolves the Claude config file under the provided home directory', () => {
		expect(getClaudeConfigPath('/tmp/playbooks-home')).toBe('/tmp/playbooks-home/.claude.json');
	});
});

describe('getCursorConfigPath', () => {
	it('resolves the Cursor config file under the provided home directory', () => {
		expect(getCursorConfigPath('/tmp/playbooks-home')).toBe('/tmp/playbooks-home/.cursor/mcp.json');
	});
});

describe('getCodexConfigPath', () => {
	it('resolves the Codex config file under the provided home directory', () => {
		expect(getCodexConfigPath('/tmp/playbooks-home')).toBe('/tmp/playbooks-home/.codex/config.toml');
	});
});

describe('getVscodeConfigPath', () => {
	it('resolves the VS Code config file under the provided home directory', () => {
		expect(getVscodeConfigPath('/tmp/playbooks-home')).toBe('/tmp/playbooks-home/.vscode/mcp.json');
	});
});

describe('mergeJsonMcpConfig', () => {
	it('adds the playbooks MCP server while preserving existing config', () => {
		const response = mergeJsonMcpConfig(
			{
				theme: 'dark',
				mcpServers: {
					existing: {
						command: 'node',
						args: ['server.js'],
					},
				},
			},
			'linux',
		);

		expect(response).toEqual({
			theme: 'dark',
			mcpServers: {
				existing: {
					command: 'node',
					args: ['server.js'],
				},
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
		});
	});
});

describe('mergeVscodeConfig', () => {
	it('adds the playbooks MCP server under the VS Code servers key while preserving existing config', () => {
		const response = mergeVscodeConfig(
			{
				settingsSync: true,
				servers: {
					existing: {
						type: 'stdio',
						command: 'node',
						args: ['server.js'],
					},
				},
			},
			'linux',
		);

		expect(response).toEqual({
			settingsSync: true,
			servers: {
				existing: {
					type: 'stdio',
					command: 'node',
					args: ['server.js'],
				},
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
		});
	});
});

describe('mergeCodexConfig', () => {
	it('adds the playbooks MCP table to an empty Codex config', () => {
		expect(mergeCodexConfig('')).toBe(
			'[mcp_servers.playbooks]\ncommand = "npx"\nargs = ["-y", "@playbooks/mcp"]\n',
		);
	});

	it('preserves unrelated Codex config sections while appending the playbooks MCP table', () => {
		const response = mergeCodexConfig('[projects."/tmp/example"]\ntrusted = true\n');

		expect(response).toBe(
			'[projects."/tmp/example"]\ntrusted = true\n\n[mcp_servers.playbooks]\ncommand = "npx"\nargs = ["-y", "@playbooks/mcp"]\n',
		);
	});

	it('replaces an existing playbooks MCP table while preserving unrelated config sections', () => {
		const response = mergeCodexConfig(
			'[projects."/tmp/example"]\ntrusted = true\n\n[mcp_servers.playbooks]\ncommand = "node"\nargs = ["old.js"]\n\n[profiles.default]\napproval_policy = "on-request"\n',
		);

		expect(response).toBe(
			'[projects."/tmp/example"]\ntrusted = true\n\n[profiles.default]\napproval_policy = "on-request"\n\n[mcp_servers.playbooks]\ncommand = "npx"\nargs = ["-y", "@playbooks/mcp"]\n',
		);
	});
});

describe('McpService.configureClaude', () => {
	const basePath = Path.join(process.cwd(), 'tmp', 'tests', 'mcp-service');
	const filePath = Path.join(basePath, '.claude.json');

	afterEach(async () => {
		await removePath(basePath);
	});

	it('creates and writes a Claude MCP config file when one does not exist', async () => {
		const service = new McpService();
		const response = await service.configureClaude({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(response.filePath).toBe(filePath);
		expect(contents).toEqual({
			mcpServers: {
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
		});
	});

	it('merges the playbooks MCP server into an existing Claude config file', async () => {
		const service = new McpService();
		await checkOrCreatePath(basePath);
		await writeFile(
			filePath,
			JSON.stringify({
				mcpServers: {
					existing: {
						command: 'node',
						args: ['server.js'],
					},
				},
				telemetry: true,
			}),
		);

		await service.configureClaude({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(contents).toEqual({
			mcpServers: {
				existing: {
					command: 'node',
					args: ['server.js'],
				},
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
			telemetry: true,
		});
	});
});

describe('McpService.configureCursor', () => {
	const basePath = Path.join(process.cwd(), 'tmp', 'tests', 'mcp-service-cursor');
	const filePath = Path.join(basePath, '.cursor', 'mcp.json');

	afterEach(async () => {
		await removePath(basePath);
	});

	it('creates and writes a Cursor MCP config file when one does not exist', async () => {
		const service = new McpService();
		const response = await service.configureCursor({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(response.filePath).toBe(filePath);
		expect(contents).toEqual({
			mcpServers: {
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
		});
	});

	it('merges the playbooks MCP server into an existing Cursor config file', async () => {
		const service = new McpService();
		await checkOrCreatePath(Path.dirname(filePath));
		await writeFile(
			filePath,
			JSON.stringify({
				mcpServers: {
					existing: {
						command: 'node',
						args: ['server.js'],
					},
				},
				telemetry: true,
			}),
		);

		await service.configureCursor({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(contents).toEqual({
			mcpServers: {
				existing: {
					command: 'node',
					args: ['server.js'],
				},
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
			telemetry: true,
		});
	});
});

describe('McpService.configureCodex', () => {
	const basePath = Path.join(process.cwd(), 'tmp', 'tests', 'mcp-service-codex');
	const filePath = Path.join(basePath, '.codex', 'config.toml');

	afterEach(async () => {
		await removePath(basePath);
	});

	it('creates and writes a Codex MCP config file when one does not exist', async () => {
		const service = new McpService();
		const response = await service.configureCodex({ filePath });
		const contents = (await readFile(filePath)).toString();

		expect(response.filePath).toBe(filePath);
		expect(contents).toBe('[mcp_servers.playbooks]\ncommand = "npx"\nargs = ["-y", "@playbooks/mcp"]\n');
	});

	it('merges the playbooks MCP table into an existing Codex config file', async () => {
		const service = new McpService();
		await checkOrCreatePath(Path.dirname(filePath));
		await writeFile(filePath, '[projects."/tmp/example"]\ntrusted = true\n');

		await service.configureCodex({ filePath });
		const contents = (await readFile(filePath)).toString();

		expect(contents).toBe(
			'[projects."/tmp/example"]\ntrusted = true\n\n[mcp_servers.playbooks]\ncommand = "npx"\nargs = ["-y", "@playbooks/mcp"]\n',
		);
	});
});

describe('McpService.configureVscode', () => {
	const basePath = Path.join(process.cwd(), 'tmp', 'tests', 'mcp-service-vscode');
	const filePath = Path.join(basePath, '.vscode', 'mcp.json');

	afterEach(async () => {
		await removePath(basePath);
	});

	it('creates and writes a VS Code MCP config file when one does not exist', async () => {
		const service = new McpService();
		const response = await service.configureVscode({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(response.filePath).toBe(filePath);
		expect(contents).toEqual({
			servers: {
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
		});
	});

	it('merges the playbooks MCP server into an existing VS Code config file', async () => {
		const service = new McpService();
		await checkOrCreatePath(Path.dirname(filePath));
		await writeFile(
			filePath,
			JSON.stringify({
				servers: {
					existing: {
						type: 'stdio',
						command: 'node',
						args: ['server.js'],
					},
				},
				settingsSync: true,
			}),
		);

		await service.configureVscode({ filePath, platform: 'linux' });
		const contents = JSON.parse((await readFile(filePath)).toString());

		expect(contents).toEqual({
			servers: {
				existing: {
					type: 'stdio',
					command: 'node',
					args: ['server.js'],
				},
				playbooks: {
					type: 'stdio',
					command: 'npx',
					args: ['-y', '@playbooks/mcp'],
				},
			},
			settingsSync: true,
		});
	});
});
