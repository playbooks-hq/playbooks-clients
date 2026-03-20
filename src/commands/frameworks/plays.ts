import ora from 'ora';
import { serializeArray } from 'src/api';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const FrameworksPlaysCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid} plays...`);
	try {
		// Setup
		const config = options.config;
		const page = options.page || null;
		const pageSize = options.pageSize || null;
		const select = options.select;
		const sortProp = options.sortProp || null;
		const sortValue = options.sortValue || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, page, pageSize, sortProp, sortValue, view, uuid });

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
		const params = client.serializeParams({ page, pageSize, sortProp, sortValue, view });
		const response = await client.query({ endpoint: `/frameworks/${uuid}/plays`, headers, params });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects, 'camel');
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
