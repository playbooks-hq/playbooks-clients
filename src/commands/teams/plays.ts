import ora from 'ora';
import { serializeArray } from 'src/api';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const TeamsPlaysCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid} plays...`);
	try {
		const config = options.config;
		const select = options.select;
		const view = options.view || null;
		logger.log('options: ', { config, select, view, uuid });

		new UpdateService({ base: config }).runCheck();
		spinner.start();

		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = client.serializeParams({ view });
		const response = await client.query({ endpoint: `/teams/${uuid}/plays`, headers, params });

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
