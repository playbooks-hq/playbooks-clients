import enquirer from 'enquirer';
import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const RegisterCommand = async (options: any) => {
	const spinner = ora('Initiating registration...');
	try {
		// Setup
		const config = options.config;
		const name = options.name || '';
		const email = options.email || '';
		const password = options.password || '';
		logger.log('options: ', { config, name, email });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();

		// Prompts
		// @ts-expect-error type issue
		const namePrompt = new enquirer.Input({ name: 'Name', message: 'Name:' });
		const formattedName = name || (await namePrompt.run());

		// @ts-expect-error type issue
		const emailPrompt = new enquirer.Input({ name: 'Email', message: 'Email Address:' });
		const formattedEmail = email || (await emailPrompt.run());

		// @ts-expect-error type issue
		const passwordPrompt = new enquirer.Password({ name: 'Password', message: 'Please enter your password.' });
		const formattedPassword = password || (await passwordPrompt.run());

		// API call
		spinner.start();

		const client = new ApiService(null);
		await client.post({
			endpoint: '/auth/register',
			data: { name: formattedName, email: formattedEmail, password: formattedPassword },
		});

		// Display
		spinner.succeed();
		console.log(`Registration successful. Please check ${formattedEmail} for a verification email.`);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
