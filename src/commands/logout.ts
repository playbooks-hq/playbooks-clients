const enquirer = require('enquirer');
const ora = require('ora');
const os = require('os');
import { ConfigService } from 'src/services/config-service';
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const logoutCommand = async (options: any) => {
	const spinner = ora('Logging out...');
	try {
		// Options
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
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
