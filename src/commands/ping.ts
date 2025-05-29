const ora = require('ora');
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const pingCommand = async (options: any) => {
	const spinner = ora('Pinging Playbooks...');
	try {
		// Setup
		const config = options.c || options.config;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Ping
		const client = new ApiService();
		const response = await client.request({ endpoint: '/' });

		// Display
		spinner.succeed();
		DisplaySuccess('Ping', response.data.message);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
