import Path from 'node:path';

import ora from 'ora';
import playbooksConfig from 'src/data/playbooks.json';
import { checkOrCreatePath, normalizeError, sleep, writeFile } from 'src/utils';
import { logger } from 'src/utils/logger';

export const InitCommand = async (options: any) => {
	const spinner = ora('Initializing play...');
	try {
		// Setup
		const config = options.config;
		const path = Path.resolve(process.cwd(), options.path);
		const filePath = Path.join(path, 'playbooks.json');
		logger.log('options: ', { config, path, filePath });

		// Start
		spinner.start();

		// Storage
		await sleep(1000);
		await checkOrCreatePath(path);
		const contents = `${JSON.stringify(playbooksConfig, null, 2)}\n`;
		await writeFile(filePath, contents);

		spinner.succeed('playbooks.json copied!');
	} catch (e) {
		spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit();
	}
};
