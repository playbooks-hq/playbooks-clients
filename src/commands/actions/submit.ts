import enquirer from 'enquirer';
import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { serialize } from 'src/utils';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const SubmitCommand = async (url, options: any) => {
	const spinner = ora(`Submitting ${url}...`);
	try {
		// Setup
		const config = options.config;
		const name = options.name;
		const variant = options.variant;
		const visibility = options.visibility;
		logger.log('options: ', { config, url, variant, visibility });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		// Prompts

		// @ts-expect-error type issue
		const namePrompt = new enquirer.Input({
			message: 'What would you like to name this play:',
			initial: name,
		});

		// @ts-expect-error type issue
		const variantPrompt = new enquirer.Input({
			message: 'Please select the play variant:',
			initial: 'starter',
			choices: ['starter', 'partial', 'template', 'stack', 'app'],
		});

		// @ts-expect-error type issue
		const visibilityPrompt = new enquirer.Input({
			message: 'Please select the play visibility:',
			initial: 'public',
			choices: ['public', 'private'],
		});

		// Start
		spinner.start();

		// Fetch
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const params = {};
		const data = { status: 'draft', url };
		const response = await client.post({ endpoint: `/account/plays`, headers, params, data });

		// Response
		const formattedData = serialize(response.data, ['id', 'status', 'name', 'uuid', 'tagline', 'syncDate']);
		const formattedResponse = JSON.stringify(formattedData, null, 2);

		// Display
		spinner.succeed();
		console.log(formattedResponse);
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
