import enquirer from 'enquirer';
import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { normalizeError, sleep, testAndFormatUUID } from 'src/utils';
import { logger } from 'src/utils/logger';

export const cloneCommand = async (entity, options: any) => {
	const uuid = testAndFormatUUID(entity);
	const spinner = ora(`Cloning ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const account = options.account || '';
		const name = options.name || '';
		const version = options.version || '';
		const isPrivate = options.private || false;
		logger.log('options: ', {
			config,
			uuid,
			account,
			name,
			private: isPrivate,
			version,
		});

		// Start
		spinner.start();
		await sleep(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Session
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const session = await client.queryRecord({ endpoint: `/session`, headers });
		const teams = await client.query({ endpoint: '/session/teams', headers });

		// Prefetch
		const entity = await client.queryRecord({
			endpoint: `/plays/${uuid}`,
			headers,
			params: { include: 'versions(preview)' },
		});

		// Preformatting
		const accountOptions = [session.data.githubAccountId, ...teams.data.map(v => v.githubAccountId)].filter(v => v);

		const versions = entity.data?.versions || [];
		const versionOptions = versions.map(version => version.name);
		const matchedVersion = versions.find(version => version.name === version);

		// Prompts
		spinner.stop();

		// @ts-expect-error type issue
		const accountPrompt = new enquirer.Select({
			name: 'Account',
			message: 'Which Github account would you like to clone to:',
			choices: accountOptions,
		});

		// @ts-expect-error type issue
		const namePrompt = new enquirer.Input({
			message: 'What would you like to name this repo:',
			initial: uuid,
		});

		// @ts-expect-error type issue
		const versionPrompt = new enquirer.Input({
			message: 'Which version would you like to clone:',
			initial: 'default',
			choices: versionOptions,
		});

		// @ts-expect-error type issue
		const privatePrompt = new enquirer.BooleanPrompt({
			message: `Would you like to make the repo private:`,
			initial: true,
		});

		// Formatting
		const accountId = account || (await accountPrompt.run());
		const repoId = name ? null : await namePrompt.run();
		const versionId = matchedVersion ? null : await versionPrompt.run();
		const privateId = isPrivate || (await privatePrompt.run());

		// Clone
		spinner.start('Cloning play...');
		const params = client.serializeParams({ accountId, repoId, versionId, private: privateId });
		await client.queryRecord({ endpoint: `/plays/${uuid}/clone`, headers, params });
		spinner.succeed();

		// Response
		const formattedData = { repo: `https://github.com/${accountId}/${repoId}` };
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		DisplaySuccess('Clone', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
