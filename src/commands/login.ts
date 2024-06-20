const enquirer = require('enquirer');
const ora = require('ora');
import { DisplayBox } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { ApiService } from 'src/services/api-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const loginCommand = async (options: any) => {
	const spinner = ora('Initiating login...');
	try {
		// Setup
		const config = options.c || options.config;
		Logger.log('options: ', { config });

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		// Prompts
		const emailPrompt = new enquirer.Input({ name: 'Login', message: 'Email Address:' });
		const email = await emailPrompt.run();

		const passwordPrompt = new enquirer.Password({ name: 'Password', message: 'Please enter your password.' });
		const password = await passwordPrompt.run();
		Logger.log('answers: ', { email, password });

		// API call
		spinner.start();
		await timeout(300);
		const client = new ApiService();
		const response = await client.post({ endpoint: '/auth/login', data: { email, password } });

		// Storage
		await service.storeValues({
			name: response.data.name,
			uuid: response.data.uuid,
			email: response.data.email,
			token: response.data.token?.token,
			account: response.data.uuid,
			accountType: 'User',
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
		DisplayBox('Login', formattedData);
	} catch (e) {
		spinner.fail('Login failed!');
		Logger.error(e);
		process.exit();
	}
};
