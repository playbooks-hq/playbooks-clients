const boxen = require('boxen');
const enquirer = require('enquirer');
const ora = require('ora');
const os = require('os');
import { serialize } from 'src/api';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const toggleCommand = async (options: any) => {
	const spinner = ora('Fetching teams...');
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		const select = options.s || options.select || `*`;
		const uuid = options.u || options.uuid || null;
		Logger.log('options: ', { config, uuid });

		// Start
		spinner.start();
		await timeout(300);

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
		const account = await prompt.run();
		const accountType = choices.map(v => v.uuid)[0] === account ? 'User' : 'Team';

		Logger.log('answer: ', { account, accountType });

		// Start
		spinner.start('Toggling account...');
		await timeout(1000);

		// Storage
		await service.storeValues({ account, accountType });
		const selectedAccount = choices.find(v => v.uuid === account);

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serialize(selectedAccount, selects);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed('Toggle succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: `Account Activated`,
				padding: 1,
				borderColor: 'cyan',
				dimBorder: true,
			}),
		);
	} catch (e) {
		spinner.fail('Toggle failed!');
		Logger.log(e);
		process.exit();
	}
};
