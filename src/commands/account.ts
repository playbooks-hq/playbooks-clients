const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { ConfigService } from 'src/services/config-service';
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const accountCommand = async (options: any) => {
	const spinner = ora('Fetching account...');
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
		const response = await client.queryRecord({ endpoint: `/session`, headers: { Authorization: contents.token } });

		// Selects
		const formattedData = {};
		const selects = select.split(',');
		Object.keys(response.data).map(key => {
			if (selects.includes('*')) return (formattedData[key] = response.data[key]);
			if (selects.includes(key)) return (formattedData[key] = response.data[key]);
		});
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: 'Account',
				padding: 1,
				borderColor: 'cyan',
				dimBorder: true,
				titleAlignment: 'center',
			}),
		);
	} catch (e) {
		spinner.fail('Config failed!');
		Logger.log(e);
		process.exit();
	}
};
