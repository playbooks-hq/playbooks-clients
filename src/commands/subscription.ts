const ora = require('ora');
import { serialize } from 'src/api';
import { DisplayBox } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const subscriptionCommand = async (options: any) => {
	const spinner = ora('Fetching subscription...');
	try {
		// Setup
		const config = options.c || options.config;
		const select = options.s || options.select;
		Logger.log('options: ', { config, select });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const endpoint = client.authUrl('/subscription');
		const headers = client.authHeaders();
		const response = await client.queryRecord({ endpoint, headers });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		DisplayBox('Subscription', formattedResponse);
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
