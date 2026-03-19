import ora from 'ora';
import { ConfigService } from 'src/services/config-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const ConfigCommand = async (options: any) => {
	const spinner = ora('Fetching config...');
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config });

		// Start
		spinner.start();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		// Response
		const data = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (data[key] = '********');
			data[key] = contents[key];
		});
		const formattedResponse = Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : 'Nothing to see yet.';

		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
