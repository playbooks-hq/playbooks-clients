import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { serialize } from 'src/utils';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const PublishCommand = async (uuid, options: any) => {
	const spinner = ora(`Publishing ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = {};
		const response = await client.update({
			endpoint: `/account/plays/${uuid}/publish`,
			headers,
			params,
			data: {},
		});

		// Response
		const formattedData = serialize(response.data, ['id', 'status', 'name', 'uuid', 'tagline', 'publishDate']);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
