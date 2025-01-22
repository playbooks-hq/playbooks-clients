const enquirer = require('enquirer');
const ora = require('ora');
import { DisplaySuccess, DisplayError } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const cloneCommand = async (uuid, options: any) => {
	const spinner = ora(`Cloning ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config;
		const path = options.s || options.path || process.cwd();
		const account = options.a || options.account || '';
		const name = options.n || options.name || '';
		const privateOption = options.p || options.private;
		const submission = options.s || options.submission;
		Logger.log('options: ', { config, path, account, name, private: privateOption });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Session
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const session = await client.queryRecord({ endpoint: `/session`, headers });
		const response = await client.query({ endpoint: '/session/teams', headers });

		// Prompts
		spinner.stop();
		const choices = [session.data.githubUserId, ...response.data.map(v => v.githubOrgId)].filter(v => v);

		const accountPrompt = new enquirer.Select({
			name: 'Account',
			message: 'Which Github account would you like to clone to:',
			choices: choices,
		});

		const namePrompt = new enquirer.Input({
			message: 'What would you like to name this repo:',
			initial: uuid,
		});

		const privatePrompt = new enquirer.BooleanPrompt({
			message: 'Would you like to make it private:',
			initial: true,
		});

		// Formatting
		const githubOwnerId = account || (await accountPrompt.run());
		const githubRepoId = name || (await namePrompt.run());
		const isPrivate = privateOption || (await privatePrompt.run());

		// Clone
		const params = client.serializeParams({ githubOwnerId, githubRepoId, private: isPrivate });
		await client.queryRecord({
			endpoint: submission ? `/submissions/${uuid}/clone` : `/repos/${uuid}/clone`,
			headers,
			params,
		});

		// Display
		spinner.succeed();
		DisplaySuccess('Clone', `https://github.com/${githubOwnerId}/${githubRepoId}`);
	} catch (e) {
		spinner.fail();
		DisplayError(formatError(e));
		process.exit();
	}
};
