import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { StorageService } from 'src/services/storage-service';
import { formatUUID, normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const downloadCommand = async (entity, options: any) => {
	const uuid = /(http(s?)):\/\//i.test(entity) ? formatUUID(entity) : entity;
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const path = options.path || process.cwd();
		const name = options.name || uuid;
		const element = options.element;
		const snippet = options.snippet;
		const stack = options.stack;
		const template = options.template;
		const version = options.version || '';
		logger.log('options: ', { config, path, name, version, element, snippet, stack, template });

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
		const formattedEndpoint = element
			? `/elements/${uuid}`
			: snippet
				? `/snippets/${uuid}`
				: stack
					? `/stacks/${uuid}`
					: `/templates/${uuid}`;

		// Prefetch
		const entity: any = await client.queryRecord({
			endpoint: formattedEndpoint,
			headers,
			params: { include: 'versions(preview)' },
		});

		// Preformatting
		const versions = entity.data?.versions || [];
		const matchedVersion = versions.find(version => version.name === version);

		// Fetch
		const params = client.serializeParams({ versionId: matchedVersion?.id });
		const response = await client.download({ endpoint: `${formattedEndpoint}/download`, headers, params });
		spinner.succeed();

		// Storage
		spinner.start('Storing zip...');
		const storageService = new StorageService({ basePath: path, fileName: name });
		await storageService.saveRepo(response.body);
		await storageService.unzipRepo();
		await storageService.removeZip();
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
