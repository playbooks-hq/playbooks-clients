import os from 'node:os';
import Path from 'node:path';

import { checkOrCreateFile, readFile, writeFile } from 'src/utils/fs';

const PLAYBOOKS_MCP_SERVER_NAME = 'playbooks';
const PLAYBOOKS_MCP_PACKAGE = '@playbooks/mcp';

export const createPlaybooksMcpServerConfig = (platform: NodeJS.Platform = process.platform) => {
	if (platform === 'win32') {
		return {
			type: 'stdio',
			command: 'cmd',
			args: ['/c', 'npx', '-y', PLAYBOOKS_MCP_PACKAGE],
		};
	}

	return {
		type: 'stdio',
		command: 'npx',
		args: ['-y', PLAYBOOKS_MCP_PACKAGE],
	};
};

export const getClaudeConfigPath = (homeDir = os.homedir()) => {
	return Path.join(homeDir, '.claude.json');
};

export const getCursorConfigPath = (homeDir = os.homedir()) => {
	return Path.join(homeDir, '.cursor', 'mcp.json');
};

export const getCodexConfigPath = (homeDir = os.homedir()) => {
	return Path.join(homeDir, '.codex', 'config.toml');
};

export const getVscodeConfigPath = (homeDir = os.homedir()) => {
	return Path.join(homeDir, '.vscode', 'mcp.json');
};

export const parseMcpConfig = (contents: string) => {
	return contents.trim().length > 0 ? JSON.parse(contents) : {};
};

export const mergeJsonMcpConfig = (config = {}, platform: NodeJS.Platform = process.platform) => {
	const formattedConfig: Record<string, any> =
		config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, any>) : {};
	const mcpServers =
		formattedConfig.mcpServers &&
		typeof formattedConfig.mcpServers === 'object' &&
		!Array.isArray(formattedConfig.mcpServers)
			? formattedConfig.mcpServers
			: {};

	return {
		...formattedConfig,
		mcpServers: {
			...mcpServers,
			[PLAYBOOKS_MCP_SERVER_NAME]: createPlaybooksMcpServerConfig(platform),
		},
	};
};

export const mergeVscodeConfig = (config = {}, platform: NodeJS.Platform = process.platform) => {
	const formattedConfig: Record<string, any> =
		config && typeof config === 'object' && !Array.isArray(config) ? (config as Record<string, any>) : {};
	const servers =
		formattedConfig.servers && typeof formattedConfig.servers === 'object' && !Array.isArray(formattedConfig.servers)
			? formattedConfig.servers
			: {};

	return {
		...formattedConfig,
		servers: {
			...servers,
			[PLAYBOOKS_MCP_SERVER_NAME]: createPlaybooksMcpServerConfig(platform),
		},
	};
};

export const createCodexMcpServerConfig = () => {
	const args = `["-y", "${PLAYBOOKS_MCP_PACKAGE}"]`;

	return `[mcp_servers.${PLAYBOOKS_MCP_SERVER_NAME}]\ncommand = "npx"\nargs = ${args}\n`;
};

export const upsertTomlTable = (contents: string, tableName: string, tableBlock: string) => {
	const lines = contents.length > 0 ? contents.split(/\r?\n/) : [];
	const formattedLines: string[] = [];
	let skippingTable = false;

	for (const line of lines) {
		const sectionMatch = line.trim().match(/^\[([^\]]+)\]$/);

		if (sectionMatch) {
			const sectionName = sectionMatch[1];
			const isTargetTable = sectionName === tableName || sectionName.startsWith(`${tableName}.`);

			if (isTargetTable) {
				skippingTable = true;
				continue;
			}

			if (skippingTable) {
				skippingTable = false;
			}
		}

		if (!skippingTable) {
			formattedLines.push(line);
		}
	}

	const formattedContents = formattedLines.join('\n').replace(/\s+$/, '');

	if (formattedContents.length === 0) {
		return tableBlock;
	}

	return `${formattedContents}\n\n${tableBlock}`;
};

export const mergeCodexConfig = (contents: string) => {
	return upsertTomlTable(contents, `mcp_servers.${PLAYBOOKS_MCP_SERVER_NAME}`, createCodexMcpServerConfig());
};

class McpService {
	async configureJsonMcpFile(props: { filePath: string; platform?: NodeJS.Platform }) {
		const filePath = props.filePath;
		const platform = props.platform || process.platform;
		const pathName = Path.dirname(filePath);
		const fileName = Path.basename(filePath);

		await checkOrCreateFile(pathName, fileName);

		const contents = await readFile(filePath).catch(() => '');
		const config = parseMcpConfig(contents.toString());
		const formattedConfig = mergeJsonMcpConfig(config, platform);

		await writeFile(filePath, `${JSON.stringify(formattedConfig, null, 2)}\n`);

		return { filePath, config: formattedConfig };
	}

	async configureClaude(props: { filePath?: string; platform?: NodeJS.Platform } = {}) {
		return await this.configureJsonMcpFile({
			filePath: props.filePath || getClaudeConfigPath(),
			platform: props.platform,
		});
	}

	async configureCursor(props: { filePath?: string; platform?: NodeJS.Platform } = {}) {
		return await this.configureJsonMcpFile({
			filePath: props.filePath || getCursorConfigPath(),
			platform: props.platform,
		});
	}

	async configureCodex(props: { filePath?: string } = {}) {
		const filePath = props.filePath || getCodexConfigPath();
		const pathName = Path.dirname(filePath);
		const fileName = Path.basename(filePath);

		await checkOrCreateFile(pathName, fileName);

		const contents = (await readFile(filePath).catch(() => '')).toString();
		const formattedConfig = mergeCodexConfig(contents);

		await writeFile(filePath, formattedConfig);

		return { filePath, config: formattedConfig };
	}

	async configureVscode(props: { filePath?: string; platform?: NodeJS.Platform } = {}) {
		const filePath = props.filePath || getVscodeConfigPath();
		const platform = props.platform || process.platform;
		const pathName = Path.dirname(filePath);
		const fileName = Path.basename(filePath);

		await checkOrCreateFile(pathName, fileName);

		const contents = await readFile(filePath).catch(() => '');
		const config = parseMcpConfig(contents.toString());
		const formattedConfig = mergeVscodeConfig(config, platform);

		await writeFile(filePath, `${JSON.stringify(formattedConfig, null, 2)}\n`);

		return { filePath, config: formattedConfig };
	}
}

export { McpService };
