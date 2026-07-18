import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { serializeArray } from 'src/utils';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const CategoriesTemplatesCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid} templates...`);
	try {
		const config = options.config;
		const page = options.page || null;
		const pageSize = options.pageSize || null;
		const query = options.query || null;
		const select = options.select;
		const sortProp = options.sortProp || null;
		const sortValue = options.sortValue || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, page, pageSize, query, sortProp, sortValue, view, uuid });

		new UpdateService({ base: config }).runCheck();
		spinner.start();

		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = client.serializeParams({ page, pageSize, query, sortProp, sortValue, view });
		const response = await client.query({ endpoint: `/categories/${uuid}/templates`, headers, params });

		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects) || [];
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
