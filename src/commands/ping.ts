const ora = require('ora');
const os = require('os');
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const pingCommand = async (url: string, options: any) => {
	try {
		// Options
		const clone = options.c || options.clone || null;
		const destination = options.d || options.destination || null;
		const environment = options.e || options.env || `${os.homedir()}/.playbooksrc`;
		const version = options.v || options.version || null;
		Logger.log('options: ', { clone, destination, environment, version });

		// Config
		const configService = new ConfigService({ basePath: environment });
		const configSpinner = ora('Setting up...\n').start();
		await timeout(300);

		const configValid = await configService.checkEmpty();
		if (!configValid) return configSpinner.fail('Please provide a valid config file.');
		const config = await configService.readContents();
		Logger.log('config: ', config);

		// Cleanup
		Logger.info('You are all done.');
	} catch (e) {
		Logger.log(e);
		Logger.error('Transfer failed:', e);
		process.exit();
	}
};
