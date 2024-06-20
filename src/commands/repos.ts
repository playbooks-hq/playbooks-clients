const boxen = require('boxen');
const ora = require('ora');
const os = require('os');
import { SuperagentService } from 'src/services/superagent-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const reposCommand = async (options: any) => {
	const spinner = ora('Fetching repos...');
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
		const response = await client.query({ endpoint: '/repos' });

		// Selects
		const formattedData = [];
		const selects = select.split(',');
		response.data.map(record => {
			const formattedRecord = {};
			Object.keys(record).map(key => {
				if (selects.includes('*')) return (formattedRecord[key] = record[key]);
				if (selects.includes(key)) return (formattedRecord[key] = record[key]);
			});
			return formattedData.push(formattedRecord);
		});
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
