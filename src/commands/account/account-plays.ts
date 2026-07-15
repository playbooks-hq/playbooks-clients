import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { serializeArray } from 'src/utils';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const AccountPlaysCommand = async (options: any) => {
	const spinner = ora('Fetching account plays...');
	try {
		// Setup
		const config = options.config;
		const page = options.page || null;
		const pageSize = options.pageSize || null;
		const select = options.select;
		const status = options.status;
		const sortProp = options.sortProp || null;
		const sortValue = options.sortValue || null;
		logger.log('options: ', { config, select, status, page, pageSize, sortProp, sortValue });

		const endpoint = `/account/plays`;

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
		const params = client.serializeParams({ status, page, pageSize, sortProp, sortValue });
		const response = await client.query({ endpoint, headers, params });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects) || [];
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
