const ora = require('ora');
import { DisplayBox } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
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
		const response = await client.queryRecord({ endpoint: '/' });

		// Display
		spinner.succeed('Your connection is working.');
		DisplayBox('Ping', response.data.message);
	} catch (e) {
		spinner.fail('Ping failed!');
		Logger.log(e);
		process.exit();
	}
};
