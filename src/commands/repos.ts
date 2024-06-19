const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const reposCommand = async (options: any) => {
	const spinner = ora('Fetching repos...\n').start();
	try {
		// Setup
		await timeout(300);

		// Options
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		Logger.log('options: ', { config });

		// Fetch
		const client = new SuperagentService();
		const response = await client.query({ endpoint: '/repos' });
		const formattedResponse = response.data.map(v => v.uuid).join('\n');

		spinner.succeed('Repos fetched!', formattedResponse);
		console.log(boxen(formattedResponse, { padding: 1 }));
		return response;
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
