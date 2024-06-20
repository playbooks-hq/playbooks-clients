const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const configCommand = async (options: any) => {
	const spinner = ora('Fetching config...');
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		Logger.log('options: ', { config });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();
		const formattedData = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (formattedData[key] = '********');
			formattedData[key] = contents[key];
		});

		spinner.succeed('Config succeeded!');
		const formattedMsg =
			Object.keys(formattedData).length > 0 ? JSON.stringify(formattedData, null, 4) : 'Nothing to see yet.';
		console.log(boxen(formattedMsg, { padding: 1 }));
	} catch (e) {
		spinner.fail('Config failed!');
		Logger.log(e);
		process.exit();
	}
};
