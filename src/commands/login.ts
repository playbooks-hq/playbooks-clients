import enquirer from 'enquirer';
import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatDate, normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const loginCommand = async (options: any) => {
	const spinner = ora('Initiating login...');
	try {
		// Setup
		const config = options.config;
		const email = options.e || options.email || '';
		const password = options.p || options.password || '';
		logger.log('options: ', { config });

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		// Prompts
		// @ts-expect-error type issue
		const emailPrompt = new enquirer.Input({ name: 'Login', message: 'Email Address:' });
		const formattedEmail = email || (await emailPrompt.run());

		// @ts-expect-error type issue
		const passwordPrompt = new enquirer.Password({ name: 'Password', message: 'Please enter your password.' });
		const formattedPassword = password || (await passwordPrompt.run());
		logger.log('answers: ', { formattedEmail, formattedPassword });

		// API call
		spinner.start();
		await sleep(300);
		const client = new ApiService();
		const response: any = await client.post({
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
			storedAt: formatDate(),
		});
		const contents = await service.readConfig();
		const data = {};
		Object.keys(contents).map(key => {
			if (key === 'token') return (data[key] = '********');
			return (data[key] = contents[key]);
		});
		const formattedData = JSON.stringify(data, null, 2);

		// Display
		spinner.succeed();
		DisplaySuccess('Login', formattedData);
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
