import ora from 'ora';
import { serializeArray } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const AccountChargesCommand = async (options: any) => {
	const spinner = ora('Fetching charges...');
	try {
		// Setup
		const config = options.config;
		const select = options.s || options.select;
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
		const response = await client.query({ endpoint: '/account/charges', headers });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects, 'camel');
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Charges', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
