import ora from 'ora';
import { McpService } from 'src/services';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const McpCodexCommand = async (options: any) => {
	const spinner = ora('Configuring Codex MCP...');
	try {
		logger.log('options: ', options);

		spinner.start();

		const service = new McpService();
		const response = await service.configureCodex();

		spinner.succeed(`Codex MCP config updated: ${response.filePath}`);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit(1);
	}
};
