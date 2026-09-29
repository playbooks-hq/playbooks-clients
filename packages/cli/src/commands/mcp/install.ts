import { CliError } from 'src/services/cli-client';
import { McpService } from 'src/services/mcp-service';

export const installMcp = async (target: string) => {
	const methods = {
		claude: 'configureClaude',
		codex: 'configureCodex',
		cursor: 'configureCursor',
		vscode: 'configureVscode',
	};
	if (!Object.hasOwn(methods, target)) throw new CliError(422, 'Choose claude, codex, cursor, or vscode.');
	const service = new McpService();
	const result = await service[methods[target]]();
	return { data: { path: result.filePath } };
};
