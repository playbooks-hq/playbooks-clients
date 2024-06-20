const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { serialize } from 'src/api';
import { ConfigService } from 'src/services/config-service';
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const subscriptionCommand = async (options: any) => {
	const spinner = ora('Fetching subscription...');
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		const select = options.s || options.select || `*`;
		Logger.log('options: ', { config, select });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new SuperagentService();
		const response = await client.queryRecord({
			endpoint: `/session/subscription`,
			headers: { Authorization: contents.token || null },
		});

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: 'Subscription',
				padding: 1,
				borderColor: 'cyan',
				dimBorder: true,
				titleAlignment: 'center',
			}),
		);
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
