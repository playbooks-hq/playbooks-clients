const ora = require('ora');
import { DisplayError, DisplaySuccess } from 'src/components';
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
		const path = options.path || process.cwd();
		const stack = options.stack;
		const submission = options.submission;
		const version = options.version || '';
		Logger.log('options: ', { config, path, version, stack, submission });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Session
		const client = new ApiService(contents);
		const headers = client.authHeaders();

		// Prefetch
		const entity = await client.queryRecord({
			endpoint: stack ? `/stacks/${uuid}` : submission ? `/submissions/${uuid}` : `/repos/${uuid}`,
			headers,
			params: { include: stack ? 'repos' : 'versions(preview)' },
		});

		// Preformatting
		const repos = entity.data?.repos || [];
		const versions = entity.data?.versions || [];

		const matchedVersionId = versions.find(version => version.name === version);

		// Fetch
		const endpoint = stack
			? `/stacks/${uuid}/download`
			: submission
			? `/submissions/${uuid}/download`
			: `/repos/${uuid}/download`;
		const params = client.serializeParams({ versionId: matchedVersionId });
		const data = []; // config each stack repo (optional)
		const response = await client.download({ method: stack ? 'post' : 'get', endpoint, headers, params, data });
		spinner.succeed();

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ basePath: path, fileName: uuid });
		await storageService.saveRepo(response.body);
		spinner.succeed();

		// Response
		const formattedData = version ? { path: `${path}/${uuid}.zip` } : { path: `${path}/${uuid}.zip` };
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		DisplaySuccess('Download', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
