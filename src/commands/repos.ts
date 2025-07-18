import ora from 'ora';
import { serializeArray } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { serializeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const reposCommand = async (options: any) => {
	const spinner = ora('Fetching repos...');
	try {
		// Setup
		const config = options.config;
		const select = options.s || options.select;
		const framework = options.framework || null;
		const language = options.language || null;
		const platform = options.platform || null;
		const team = options.team || null;
		const tool = options.tool || null;
		const topic = options.topic || null;
		const user = options.user || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, framework, language, platform, team, tool, topic, user, view });

		const endpoint = framework
			? `/frameworks/${framework}/repos`
			: language
				? `/languages/${language}/repos`
				: platform
					? `/platforms/${platform}/repos`
					: team
						? `/teams/${team}/repos`
						: tool
							? `/tools/${tool}/repos`
							: topic
								? `/topics/${topic}/repos`
								: user
									? `/users/${user}/repos`
									: `/repos`;

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
		const params = client.serializeParams({ view });
		const response = await client.query({ endpoint, headers, params });

		// Response
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray('camel', response.data, selects);
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed();
		DisplaySuccess('Repos', formattedResponse);
	} catch (e) {
		spinner.fail();
		DisplayError(serializeError(e));
		process.exit();
	}
};
