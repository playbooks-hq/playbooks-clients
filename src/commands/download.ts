import Path from 'node:path';

import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { StorageService } from 'src/services/storage-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError, sleep, testAndFormatUUID } from 'src/utils';
import { logger } from 'src/utils/logger';

export const downloadCommand = async (entity, options: any) => {
	const uuid = testAndFormatUUID(entity);
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const path = Path.join(process.cwd(), options.path);
		const name = options.name || uuid;
		const version = options.version || '';
		logger.log('options: ', { config, uuid, path, name, version });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		// Session
		const client = new ApiService(contents);
		const headers = client.authHeaders();

		// Prefetch
		const entity = await client.queryRecord({
			endpoint: `/plays/${uuid}`,
			headers,
			params: { include: 'versions(preview)' },
		});

		// Preformatting
		const versions = entity.data?.versions || [];
		const matchedVersion = versions.find(version => version.name === version);

		// Fetch
		const params = client.serializeParams({ versionId: matchedVersion?.id });
		const response = await client.download({ endpoint: `/plays/${uuid}/download`, headers, params });
		spinner.succeed();

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ base: path, fileName: name });
		await storageService.save(response.body);
		await storageService.unzip();
		await storageService.remove();
		spinner.succeed();

		// Response
		const formattedData = version ? { path: `${path}/${name}` } : { path: `${path}/${name}` };
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		DisplaySuccess('Download', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
