import ora from 'ora';
import { DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { UpdateService } from 'src/services/update-service';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

export const LogoutCommand = async (options: any) => {
	const spinner = ora('Logging out...');
	try {
		// Options
		const config = options.config;
		logger.log('options: ', { config });

		// Update
		new UpdateService({ base: config }).runCheck();

		// Start
		spinner.start();

		// Config
		const service = new ConfigService({ base: config });
		await service.setup();

		// Logout
		await service.clear();
		spinner.succeed();
	} catch (e) {
		spinner.fail();
		DisplayError(normalizeError(e));
		process.exit();
	}
};
