const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { serializeArray } from 'src/api';
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const reposCommand = async (options: any) => {
	const spinner = ora('Fetching repos...');
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		const select = options.s || options.select || `*`;
		const framework = options.framework || null;
		const language = options.language || null;
		const platform = options.platform || null;
		const tool = options.tool || null;
		const topic = options.topic || null;
		const view = options.view || null;
		Logger.log('options: ', { config, select, framework, language, platform, tool, topic, view });

		const endpoint = framework
			? `/frameworks/${framework}/repos`
			: language
			? `/languages/${language}/repos`
			: platform
			? `/platforms/${platform}/repos`
			: tool
			? `/tools/${tool}/repos`
			: topic
			? `/topics/${topic}/repos`
			: `/repos`;

		// Start
		spinner.start();
		await timeout(300);

		// Fetch
		const client = new SuperagentService();
		const response = await client.query({ endpoint, params: { view } });

		// Selects
		const selects = select !== '*' ? select.split(',') : [];
		const formattedData = serializeArray(response.data, selects);
		const formattedResponse = formattedData.map(data => JSON.stringify(data, null, 2)).join(',\n');

		// Display
		spinner.succeed('Fetch succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: 'Repos',
				padding: 1,
				borderColor: 'cyan',
				dimBorder: true,
				titleAlignment: 'center',
			}),
		);
		return response;
	} catch (e) {
		spinner.fail('Fetch failed!');
		Logger.log(e);
		process.exit();
	}
};
