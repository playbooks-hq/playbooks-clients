const ora = require('ora');
import { serializeArray } from 'src/api';
import { DisplayBox } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const ordersCommand = async (options: any) => {
	const spinner = ora('Fetching orders...');
	try {
		// Setup
		const config = options.c || options.config;
		const entity = options.e || options.entity || ``;
		const select = options.s || options.select;
		Logger.log('options: ', { config, entity, select });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const endpoint = client.authUrl('/orders');
		const headers = client.authHeaders();
		const params = client.serializeParams({ entityType: entity });
		const response = await client.query({ endpoint, headers, params });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects);
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed('Fetch succeeded!');
		DisplayBox('Orders', formattedResponse);
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
