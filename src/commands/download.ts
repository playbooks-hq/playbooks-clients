const ora = require('ora');
import { DisplaySuccess, DisplayError } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { StorageService } from 'src/services/storage-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const downloadCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config;
		const path = options.p || options.path || process.cwd();
		const submission = options.s || options.submission;
		const unzip = options.z || options.unzip;
		const remove = options.r || options.remove;
		Logger.log('options: ', { config, path, unzip, remove });

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
		const response = await client.download({
			endpoint: submission ? `/submissions/${uuid}/download` : `/repos/${uuid}/download`,
			headers,
			params,
		});
		spinner.succeed();

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ basePath: path, fileName: uuid });
		await storageService.saveRepo(response.body);
		if (unzip) await storageService.unzipRepo();
		if (remove) await storageService.removeZip();
		spinner.succeed();

		// Display
		DisplaySuccess('Download', `${path}/${uuid}.zip`);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
