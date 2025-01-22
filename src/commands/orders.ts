const ora = require('ora');
import { serializeArray } from 'src/api';
import { DisplaySuccess, DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { formatError, timeout } from 'src/utils';
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
		const headers = client.authHeaders();
		const params = client.serializeParams({ entityType: entity });
		const response = await client.query({ endpoint: '/account/orders', headers, params });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects);
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed();
		DisplaySuccess('Orders', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
