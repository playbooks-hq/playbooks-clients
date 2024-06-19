const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const pingCommand = async (options: any) => {
	const spinner = ora('Pinging Playbooks...\n').start();
	try {
		// Setup
		await timeout(300);

		// Options
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		Logger.log('options: ', { config });

		// Ping
		const client = new SuperagentService();
		const response = await client.queryRecord({ endpoint: '/' });
		await timeout(300);
		spinner.succeed('Your connection is working.');
		Logger.log(boxen(response.data.message, { padding: 1 }));
		return response;
	} catch (e) {
		spinner.fail('Ping failed. Please contact support.');
		Logger.log(e);
		process.exit();
	}
};
