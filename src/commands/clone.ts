import enquirer from 'enquirer';
import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatUUID, serializeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const cloneCommand = async (entity, options: any) => {
	const uuid = !/(http(s?)):\/\//i.test(entity) ? formatUUID(entity) : entity;
	const spinner = ora(`Cloning ${uuid}...`);
	try {
		// Setup
		const config = options.config;
		const account = options.account || '';
		const name = options.name || '';
		const version = options.version || '';
		const privateOption = options.private;
		const stack = options.stack;
		const submission = options.submission;
		logger.log('options: ', { config, account, name, private: privateOption, stack, submission, version });

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
		const session: any = await client.queryRecord({ endpoint: `/session`, headers });
		const teams = await client.query({ endpoint: '/session/teams', headers });

		// Prefetch
		const entity: any = await client.queryRecord({
			endpoint: stack ? `/stacks/${uuid}` : submission ? `/submissions/${uuid}` : `/repos/${uuid}`,
			headers,
			params: { include: stack ? 'repos' : 'versions(preview)' },
		});

		// Preformatting
		const repos = entity.data?.repos || [];
		const versions = entity.data?.versions || [];

		const matchedRepoId = repos.find(repo => repo.name === name);
		const matchedVersionId = versions.find(version => version.name === version);

		// Prompts
		spinner.stop();
		const choices = [session.data.githubUserId, ...teams.data.map(v => v.githubOrgId)].filter(v => v);

		// @ts-expect-error type issue
		const accountPrompt = new enquirer.Select({
			name: 'Account',
			message: 'Which Github account would you like to clone to:',
			choices: choices,
		});

		// @ts-expect-error type issue
		const namePrompt = new enquirer.Input({
			message: 'What would you like to name this repo:',
			initial: uuid,
		});

		// @ts-expect-error type issue
		const versionPrompt = new enquirer.Input({
			message: 'Which version would you like to clone:',
			initial: '',
		});

		// @ts-expect-error type issue
		const privatePrompt = new enquirer.BooleanPrompt({
			message: `Would you like to make ${stack ? 'them' : 'it'} private:`,
			initial: true,
		});

		// Formatting
		const accountId = account || (await accountPrompt.run());
		const repoId = name || stack ? null : await namePrompt.run();
		const versionId = version || stack ? null : await versionPrompt.run();
		const isPrivate = privateOption || (await privatePrompt.run());

		// Clone
		const endpoint = stack
			? `/stacks/${uuid}/clone`
			: submission
				? `/submissions/${uuid}/clone`
				: `/repos/${uuid}/clone`;
		const params = client.serializeParams({ accountId, repoId, versionId, private: isPrivate });
		const data = repos.map(repo => ({
			uuid: repo.uuid,
			accountId,
			repoId: repo.uuid,
			isPrivate,
		}));

		stack
			? await client.post({ endpoint, headers, params, data })
			: await client.queryRecord({ endpoint, headers, params });

		// Response
		const formattedData = stack
			? data.map(record => ({
					[record.repoId]: `https://github.com/${record.accountId}/${record.repoId}`,
				}))
			: {
					[repoId]: `https://github.com/${accountId}/${repoId}`,
				};
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Clone', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(serializeError(e));
		process.exit();
	}
};
