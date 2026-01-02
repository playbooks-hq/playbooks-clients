import ora from 'ora';
import { serializeArray } from 'src/api';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const playsCommand = async (options: any) => {
	const spinner = ora('Fetching plays...');
	try {
		// Setup
		const config = options.config;
		const select = options.s || options.select;
		const framework = options.framework || null;
		const language = options.language || null;
		const platform = options.platform || null;
		const team = options.team || null;
		const tool = options.tool || null;
		const tag = options.tag || null;
		const user = options.user || null;
		const view = options.view || null;
		logger.log('options: ', { config, select, framework, language, platform, team, tool, tag, user, view });

		const endpoint = framework
			? `/frameworks/${framework}/plays`
			: language
				? `/languages/${language}/plays`
				: platform
					? `/platforms/${platform}/plays`
					: team
						? `/teams/${team}/plays`
						: tool
							? `/tools/${tool}/plays`
							: tag
								? `/tags/${tag}/plays`
								: user
									? `/users/${user}/plays`
									: `/plays`;

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
		DisplayError(normalizeError(e));
		process.exit();
	}
};
