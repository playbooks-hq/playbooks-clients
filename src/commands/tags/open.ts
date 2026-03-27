import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { httpError, normalizeError, openUrl } from 'src/utils';
import { logger } from 'src/utils/logger';

export const TagsOpenCommand = async (uuid, options: any) => {
	const spinner = ora(`Opening tag ${uuid}...`);
	try {
		const config = options.config;
		logger.log('options: ', { config, uuid });

		new UpdateService({ base: config }).runCheck();
		spinner.start();

		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const response = await client.queryRecord({ endpoint: `/tags/${uuid}`, headers });
		const webUrl = response.data?.webUrl;

		if (!webUrl) throw httpError(422, 'This tag does not have a webUrl.');

		await openUrl(webUrl);

		const formattedResponse = JSON.stringify({ webUrl }, null, 2);

		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
