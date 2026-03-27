import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { httpError, normalizeError, openUrl } from 'src/utils';
import { logger } from 'src/utils/logger';

export const PlaysOpenCommand = async (uuid, options: any) => {
	const spinner = ora(`Opening ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config, uuid });

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
		const response = await client.queryRecord({ endpoint: `/plays/${uuid}`, headers });
		const webUrl = response.data?.webUrl;

		if (!webUrl) throw httpError(422, 'This play does not have a webUrl.');

		// Open
		await openUrl(webUrl);

		// Response
		const formattedResponse = JSON.stringify({ webUrl }, null, 2);

		// Display
		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
