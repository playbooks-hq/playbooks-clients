const ora = require('ora');
import { DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { formatError, sleep } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const logoutCommand = async (options: any) => {
	const spinner = ora('Logging out...');
	try {
		// Options
		const config = options.config;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		// Logout
		await service.clear();
		spinner.succeed();
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
