const enquirer = require('enquirer');
const ora = require('ora');
import { DisplaySuccess, DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { formatError, timeout } from 'src/utils';
import * as Logger from 'src/utils/logger';

export const loginCommand = async (options: any) => {
	const spinner = ora('Initiating login...');
	try {
		// Setup
		const config = options.c || options.config;
		const email = options.e || options.email || '';
		const password = options.p || options.password || '';
		Logger.log('options: ', { config });

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		// Prompts
		const emailPrompt = new enquirer.Input({ name: 'Login', message: 'Email Address:' });
		const formattedEmail = email || (await emailPrompt.run());

		const passwordPrompt = new enquirer.Password({ name: 'Password', message: 'Please enter your password.' });
		const formattedPassword = password || (await passwordPrompt.run());
		Logger.log('answers: ', { formattedEmail, formattedPassword });

		// API call
		spinner.start();
		await timeout(300);
		const client = new ApiService();
		const response = await client.post({
			endpoint: '/auth/login',
			data: { email: formattedEmail, password: formattedPassword },
		});

		// Storage
		await service.storeValues({
			id: response.data.id,
			name: response.data.name,
			uuid: response.data.uuid,
			email: response.data.email,
			token: response.data.token?.token,
			account: response.data.uuid,
		});
		const contents = await service.readConfig();
		const data = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (data[key] = '********');
			data[key] = contents[key];
		});
		const formattedData = JSON.stringify(data, null, 2);

		// Display
		spinner.succeed('Login succeeded!');
		DisplaySuccess('Login', formattedData);
	} catch (e) {
		spinner.fail('Login failed!');
		DisplayError(formatError(e));
		process.exit();
	}
};
