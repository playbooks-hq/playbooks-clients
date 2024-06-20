const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const pingCommand = async (options: any) => {
	const spinner = ora('Pinging Playbooks...');
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Ping
		const client = new ApiService();
		const response = await client.queryRecord({ endpoint: '/' });
		spinner.succeed('Your connection is working.');
		console.log(boxen(response.data.message, { padding: 1 }));
		return response;
	} catch (e) {
		spinner.fail('Ping failed!');
		Logger.log(e);
		process.exit();
	}
};
