import cors from 'cors';
import express from 'express';
import { exec } from 'node:child_process';
import ora from 'ora';
import { DisplayError, DisplaySuccess } from 'src/components';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { formatDate, normalizeError, sleep } from 'src/utils';
import { logger } from 'src/utils/logger';

const PORT = import.meta.env.VITE_PORT || 4000;
const VITE_WEB_DOMAIN = import.meta.env.VITE_WEB_DOMAIN;
const CALLBACK_URL = `http://localhost:${PORT}/cli`;

export const oauthCommand = async (options: any) => {
	const spinner = ora('Initiating oauth...');
	try {
		// Setup
		const config = options.config;
		logger.log('options: ', { config });

		// Config
		const service = new ConfigService({ basePath: config });
		await service.setup();

		spinner.succeed();
		spinner.start('connecting to Github...');

		const formatCommand = url => {
			switch (process.platform) {
				case 'darwin':
					return `open ${url}`;
				case 'win32':
					return `start ${url}`;
				default:
					return `xdg-open ${url}`;
			}
		};

		// Server
		const json = await new Promise((resolve, reject) => {
			const app = express();
			app.use(cors());

			const timeout = setTimeout(
				() => reject({ status: 422, message: 'Authorization timed out. Please try again.' }),
				30000,
			);

			const server = app.listen(PORT, () => {
				const authUrl = new URL(VITE_WEB_DOMAIN + '/oauth/cli');
				const command = formatCommand(authUrl.toString());
				exec(command);
			});

			app.get('/cli', (req, res, next) => {
				const url = new URL(req.url, CALLBACK_URL);
				const params = new URLSearchParams(url.search);
				const code = params.get('code');
				const state = params.get('state');
				res.json({});
				server.close(() => {
					clearTimeout(timeout);
					resolve({ code, state });
				});
			});
		});

		// Notes
		spinner.succeed();
		logger.log('json: ', json);

		// API call
		spinner.start('performing handshake...');
		await sleep(300);
		const client = new ApiService();
		const response: any = await client.post({ endpoint: '/oauth/github-auth', data: json });

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
