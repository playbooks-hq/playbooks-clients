const ora = require('ora');
import { serializeArray } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatError, sleep } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const cardsCommand = async (options: any) => {
	const spinner = ora('Fetching cards...');
	try {
		// Setup
		const config = options.config;
		const select = options.s || options.select;
		Logger.log('options: ', options, { config, select });

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const response = await client.query({ endpoint: '/account/cards', headers });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray('camel', response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Cards', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
