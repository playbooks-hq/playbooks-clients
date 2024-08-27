const ora = require('ora');
import { serializeArray } from 'src/api';
import { DisplaySuccess, DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const chargesCommand = async (options: any) => {
	const spinner = ora('Fetching charges...');
	try {
		// Setup
		const config = options.c || options.config;
		const select = options.s || options.select;
		Logger.log('options: ', options, { config, select });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const response = await client.query({ endpoint: '/account/charges', headers });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		DisplaySuccess('Charges', formattedResponse);
	} catch (e) {
		spinner.fail('Fetch failed!');
		DisplayError(formatError(e));
		process.exit();
	}
};
