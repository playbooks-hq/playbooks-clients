const enquirer = require('enquirer');
const ora = require('ora');
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatError, sleep } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const toggleCommand = async (options: any) => {
	const spinner = ora('Fetching teams...');
	try {
		// Setup
		const config = options.c || options.config;
		const uuid = options.u || options.uuid || null;
		Logger.log('options: ', { config, uuid });

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const session = await client.queryRecord({ endpoint: '/session', headers });
		const response = await client.query({ endpoint: '/session/teams', headers });

		// Prompts
		spinner.stop();
		const choices = [session.data, ...response.data];
		const prompt = new enquirer.Select({
			name: 'Account',
			message: 'Please select an account:',
			choices: choices.map(v => v.uuid),
		});
		const account = uuid || (await prompt.run());

		Logger.log('answer: ', { account });

		// Start
		spinner.start('Toggling account...');
		await sleep(1000);

		// Storage
		await service.storeValues({ account });
		const selectedAccount = choices.find(v => v.uuid === account);

		// Display
		spinner.succeed();
		DisplaySuccess('Account', selectedAccount.name);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
