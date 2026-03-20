import ora from 'ora';
import { ApiService } from 'src/services/api-service';
import { ConfigService } from 'src/services/config-service';
import { SseService } from 'src/services/sse-service';
import { UpdateService } from 'src/services/update-service';
import { sseEventType } from 'src/types';
import { normalizeError } from 'src/utils';
import { logger } from 'src/utils/logger';

const formatStreamPayload = (event: sseEventType) => {
	if (typeof event.data === 'string') return event.data;
	return JSON.stringify(event.data, null, 2);
};

export const formatDemoStreamEvent = (event: sseEventType) => {
	const timestamp = new Date().toLocaleTimeString();
	const label = event.event || 'message';
	const payload = formatStreamPayload(event);
	return `[${timestamp}] ${label}\n${payload}\n\n`;
};

export const streamDemoCommand = async ({ endpoint, subdomain, options, spinnerText }) => {
	const spinner = ora(spinnerText);
	const controller = new AbortController();
	let streamOpened = false;
	let interrupted = false;

	const onInterrupt = () => {
		interrupted = true;
		controller.abort();
	};

	process.once('SIGINT', onInterrupt);

	try {
		const config = options.config;
		logger.log('options: ', { config, subdomain });

		new UpdateService({ base: config }).runCheck();
		spinner.start();

		const service = new ConfigService({ base: config });
		await service.setup();
		const contents = await service.readConfig();

		const apiClient = new ApiService(contents);
		const streamClient = new SseService({
			computeURL: apiClient.computeURL.bind(apiClient),
			computeHeaders: (headers = {}) => apiClient.computeHeaders({ accept: 'text/event-stream', ...headers }),
		});
		const headers = apiClient.authHeaders();

		await streamClient.streamSse({
			endpoint,
			headers,
			signal: controller.signal,
			onOpen: () => {
				streamOpened = true;
				spinner.stop();
			},
			onEvent: event => {
				process.stdout.write(formatDemoStreamEvent(event));
			},
		});
	} catch (e) {
		if (interrupted || controller.signal.aborted || e?.name === 'AbortError') {
			if (!streamOpened) spinner.stop();
			console.log('Stream closed.');
			return;
		}

		if (!streamOpened) spinner.fail();
		console.error(JSON.stringify(normalizeError(e), null, 2));
		process.exit(1);
	} finally {
		process.removeListener('SIGINT', onInterrupt);
	}
};
