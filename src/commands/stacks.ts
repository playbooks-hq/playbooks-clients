const ora = require('ora');
import { serializeArray } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { serializeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const stacksCommand = async (options: any) => {
	const spinner = ora('Fetching stacks...');
	try {
		// Setup
		const config = options.config;
		const select = options.s || options.select;
		const team = options.team || null;
		const user = options.user || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, team, user, view });

		const endpoint = team ? `/teams/${team}/stacks` : user ? `/users/${user}/stacks` : `/stacks`;

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
		const params = client.serializeParams({ view });
		const response = await client.query({ endpoint, headers, params });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray('camel', response.data, selects);
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed();
		DisplaySuccess('stacks', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(serializeError(e));
		process.exit();
	}
};
