import ora from 'ora';
import { serialize } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const playCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const include = options.i || options.include;
		const select = options.s || options.select;
		logger.log('options: ', { config, select });

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
		const params = client.serializeParams({ include });
		const response = await client.queryRecord({ endpoint: `/plays/${uuid}`, headers, params });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Play', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
