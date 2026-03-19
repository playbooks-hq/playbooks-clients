import ora from 'ora';
import { serialize } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const AccountSubscriptionCommand = async (options: any) => {
	const spinner = ora('Fetching subscription...');
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
		const response = await client.queryRecord({ endpoint: '/account/subscription', headers });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Subscription', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
