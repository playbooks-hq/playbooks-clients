const ora = require('ora');
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const logoutCommand = async (options: any) => {
	const spinner = ora('Logging out...');
	try {
		// Options
		const config = options.c || options.config;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		// Logout
		await service.clear();
		spinner.succeed('Logout succeeded!');
	} catch (e) {
		spinner.fail('Logout failed!');
		Logger.log(e);
		process.exit();
	}
};
