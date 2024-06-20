const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { serialize } from 'src/api';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const repoCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		const select = options.s || options.select || `*`;
		Logger.log('options: ', { config, select });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = client.serializeParams({});
		const response = await client.queryRecord({ endpoint: `/repos/${uuid}`, headers, params });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(response.data, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Fetch succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: 'Repo',
				padding: 1,
				borderColor: 'cyan',
				dimBorder: true,
			}),
		);
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
