import enquirer from 'enquirer';
import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const toggleCommand = async (options: any) => {
	const spinner = ora('Fetching teams...');
	try {
		// Setup
		const config = options.config;
		const uuid = options.u || options.uuid || null;
		logger.log('options: ', { config, uuid });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ base: config });
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

		// @ts-expect-error type issue
		const prompt = new enquirer.Select({
			name: 'Account',
			message: 'Please select an account:',
			choices: choices.map(v => v.uuid),
		});
		const account = uuid || (await prompt.run());

		logger.log('answer: ', { account });

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
		DisplayError(normalizeError(e));
		process.exit();
	}
};
