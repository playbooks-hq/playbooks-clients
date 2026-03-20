import ora from 'ora';
import { serializeArray } from 'src/api';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const UsersPlaysCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid} plays...`);
	try {
		const config = options.config;
		const page = options.page || null;
		const pageSize = options.pageSize || null;
		const select = options.select;
		const sortProp = options.sortProp || null;
		const sortValue = options.sortValue || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, page, pageSize, sortProp, sortValue, view, uuid });

		new UpdateService({ base: config }).runCheck();
		spinner.start();

		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = client.serializeParams({ page, pageSize, sortProp, sortValue, view });
		const response = await client.query({ endpoint: `/users/${uuid}/plays`, headers, params });

		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects, 'camel');
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
