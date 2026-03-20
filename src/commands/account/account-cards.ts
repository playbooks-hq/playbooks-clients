import ora from 'ora';
import { serializeArray } from 'src/api';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const AccountCardsCommand = async (options: any) => {
	const spinner = ora('Fetching cards...');
	try {
		// Setup
		const config = options.config;
		const select = options.select;
		logger.log('options: ', options, { config, select });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const response = await client.query({ endpoint: '/account/cards', headers });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects, 'camel');
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
