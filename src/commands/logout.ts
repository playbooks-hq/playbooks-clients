import ora from 'ora';
import { DisplayError } from 'src/components';
import { ConfigService } from 'src/services/config-service';
import { normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

export const logoutCommand = async (options: any) => {
	const spinner = ora('Logging out...');
	try {
		// Options
		const config = options.config;
		logger.log('options: ', { config });

		// Start
		spinner.start();
		await sleep(300);

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
