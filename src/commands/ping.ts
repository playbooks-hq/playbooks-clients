import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { serializeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const pingCommand = async (options: any) => {
	const spinner = ora('Pinging Playbooks...');
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config });

		// Start
		spinner.start();
		await sleep(300);

		// Ping
		const client = new ApiService();
		const response = await client.request({ endpoint: '/' });

		// Display
		spinner.succeed();
		DisplaySuccess('Ping', response.data.message);
	} catch (e) {
		spinner.fail();
		DisplayError(serializeError(e));
		process.exit();
	}
};
