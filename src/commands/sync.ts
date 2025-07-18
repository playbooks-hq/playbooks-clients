import ora from 'ora';
import { serialize } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { serializeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const syncCommand = async (uuid, options: any) => {
	const spinner = ora(`Syncing ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const submission = options.submission;
		logger.log('options: ', { config, submission });

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
		const params = {};
		const response = await client.queryRecord({
			endpoint: submission ? `/submissions/${uuid}/sync` : `/repos/${uuid}/sync`,
			headers,
			params,
		});

		// Response
		const formattedData = serialize('camel', response.data, ['id', 'status', 'name', 'uuid', 'tagline', 'syncDate']);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Sync', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(serializeError(e));
		process.exit();
	}
};
