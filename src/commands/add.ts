import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { ShellService } from 'src/services/shell-service';
import { StorageService } from 'src/services/storage-service';
import { httpError, normalizeError, sleep, testAndFormatUUID } from 'src/utils';
import { logger } from 'src/utils/logger';

export const addCommand = async (entity, options: any) => {
	const uuid = testAndFormatUUID(entity);
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const path = options.path || process.cwd();
		const name = options.name || uuid;
		const version = options.version || '';
		logger.log('options: ', { config, uuid, path, name, version });

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
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
		const playParams = client.serializeParams({ include: ['demo'] });
		const play = await client.download({ endpoint: `/plays/${uuid}`, headers, params: playParams });
		if (play.body.variant !== 'partial') throw httpError(422, 'You can only run this command for partials');
		spinner.succeed();

		// Download
		spinner.start('Downloading zip...');
		const params = client.serializeParams({ versionId: matchedVersion?.id });
		const download = await client.download({ endpoint: `/plays/${uuid}/download`, headers, params });
		spinner.succeed();

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ basePath: path, fileName: name });
		await storageService.save(download.body);
		await storageService.unzip();
		await storageService.remove();
		spinner.succeed();

		// Install
		spinner.start('Running install...');
		const shellService = new ShellService({});
		await shellService.command(play.body?.play?.demo?.install);
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
