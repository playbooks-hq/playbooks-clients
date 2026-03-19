import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const PingCommand = async (options: any) => {
	const spinner = ora('Pinging Playbooks...');
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();

		// Ping
		const client = new ApiService(null);
		const response = await client.request({ endpoint: '/' });

		// Display
		spinner.succeed();
		DisplaySuccess('Ping', response.data.message);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
