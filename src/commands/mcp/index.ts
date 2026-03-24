import { McpClaudeCommand } from 'src/commands/mcp/claude';
import { McpCodexCommand } from 'src/commands/mcp/codex';
import { McpCursorCommand } from 'src/commands/mcp/cursor';
import { McpVscodeCommand } from 'src/commands/mcp/vscode';

export const McpCommand = async (action, options: any) => {
	if (action === 'claude') return await McpClaudeCommand(options);
	if (action === 'codex') return await McpCodexCommand(options);
	if (action === 'cursor') return await McpCursorCommand(options);
	if (action === 'vscode') return await McpVscodeCommand(options);

	const detail = action ? `Unsupported MCP target: ${action}` : 'Please specify an MCP target.';
	console.error(JSON.stringify({ detail }, null, 2));
	process.exit(1);
};
