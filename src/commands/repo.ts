const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const repoCommand = async (uuid, options: any) => {
	const spinner = ora(`Fetching ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config || `${os.homedir()}/.playbooksrc`;
		const select = options.s || options.select || `*`;
		Logger.log('options: ', { config, select });

		// Start
		spinner.start();
		await timeout(300);

		// Fetch
		const client = new SuperagentService();
		const response = await client.queryRecord({ endpoint: `/repos/${uuid}` });
		const formattedData = {};
		const selects = select.split(',');
		Object.keys(response.data).map(key => {
			if (selects.includes('*')) return (formattedData[key] = response.data[key]);
			if (selects.includes(key)) return (formattedData[key] = response.data[key]);
		});
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		spinner.succeed('Fetch succeeded!');
		console.log(
			boxen(formattedResponse, {
				title: 'Repo',
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
