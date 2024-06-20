const ora = require('ora');
import { DisplayBox } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { StorageService } from 'src/services/storage-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const downloadCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config;
		const path = options.s || options.path || process.cwd();
		const unzip = options.z || options.unzip;
		const clean = options.z || options.clean;
		Logger.log('options: ', { config, path, name, unzip });

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
		const response = await client.download({ endpoint: `/repos/${uuid}/download`, headers, params });
		spinner.succeed('Download received!');
		Logger.log('response: ', response);

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ basePath: path, fileName: uuid });
		await storageService.saveRepo(response.body);
		if (unzip) await storageService.unzipRepo();
		if (clean) await storageService.removeZip();
		spinner.succeed('Storage complete!');

		// Display
		DisplayBox('Download', `${path}/${name}.zip`);
	} catch (e) {
		spinner.fail('Download failed!');
		Logger.log(e);
		process.exit();
	}
};
