const ora = require('ora');
import { DisplayBox } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const configCommand = async (options: any) => {
	const spinner = ora('Fetching config...');
	try {
		// Setup
		const config = options.c || options.config;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Selects
		const data = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (data[key] = '********');
			data[key] = contents[key];
		});
		const formattedResponse = Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : 'Nothing to see yet.';

		spinner.succeed('Config succeeded!');
		DisplayBox('Config', formattedResponse);
	} catch (e) {
		spinner.fail('Config failed!');
		Logger.log(e);
		process.exit();
	}
};
