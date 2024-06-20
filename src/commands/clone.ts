const ora = require('ora');
import { DisplayBox } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { timeout } from 'src/utils/helpers';
import * as Logger from 'src/utils/logger';

export const cloneCommand = async (uuid, options: any) => {
	const spinner = ora(`Cloning ${uuid}...`);
	try {
		// Setup
		const config = options.c || options.config;
		const path = options.s || options.path || process.cwd();
		const org = options.o || options.org;
		const name = options.n || options.name;
		const priv = options.p || options.private;
		Logger.log('options: ', { config, path, org, name, private: priv });

		// Start
		spinner.start();
		await timeout(300);

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();
		const contents = await service.readConfig();

		// Session
		const client = new ApiService(contents);
		const headers = client.authHeaders();
		const response = await client.queryRecord({ endpoint: `/session`, headers });

		// Formatting
		const githubOwnerId = org || response.data.githubUserId;
		const githubRepoId = name || uuid;

		// Clone
		const params = client.serializeParams({ githubOwnerId, githubRepoId, private: priv });
		await client.queryRecord({ endpoint: `/repos/${uuid}/clone`, headers, params });

		// Display
		spinner.succeed('Clone succeeded!');
		DisplayBox('Clone', `https://github.com/${githubOwnerId}/${githubRepoId}`);
	} catch (e) {
		spinner.fail('Clone failed!');
		Logger.log(e);
		process.exit();
	}
};
