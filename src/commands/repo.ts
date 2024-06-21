const ora = require('ora');
import { serialize } from 'src/api';
import { DisplaySuccess, DisplayError } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const repoCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config;
		const include = options.i || options.include;
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
		const headers = client.authHeaders();
		const params = client.serializeParams({ include });
		const response = await client.queryRecord({ endpoint: `/repos/${uuid}`, headers, params });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		DisplaySuccess('Repo', formattedResponse);
	} catch (e) {
		spinner.fail('Fetch failed!');
		DisplayError(formatError(e));
		process.exit();
	}
};
