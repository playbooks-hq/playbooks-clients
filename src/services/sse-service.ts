import { streamQueryType, sseEventType } from 'src/types';

const DELIMITER_PATTERN = /\r\n\r\n|\n\n|\r\r/;

const parseEventData = (rawData: string) => {
	if (!rawData) return '';

	try {
		return JSON.parse(rawData);
	} catch {
		return rawData;
	}
};

export const parseSseEvent = (frame: string): sseEventType | null => {
	const lines = frame.split(/\r\n|\n|\r/);
	const dataLines = [];
	let event: string | null = null;
	let id;
	let retry;

	for (const line of lines) {
		if (!line || line.startsWith(':')) continue;

		const delimiterIndex = line.indexOf(':');
		const field = delimiterIndex === -1 ? line : line.slice(0, delimiterIndex);
		let value = delimiterIndex === -1 ? '' : line.slice(delimiterIndex + 1);

		if (value.startsWith(' ')) value = value.slice(1);

		switch (field) {
			case 'event':
				event = value || null;
				break;
			case 'data':
				dataLines.push(value);
				break;
			case 'id':
				id = value;
				break;
			case 'retry': {
				const parsedRetry = Number(value);
				if (Number.isFinite(parsedRetry)) retry = parsedRetry;
				break;
			}
			default:
				break;
		}
	}

	if (dataLines.length === 0) return null;

	const rawData = dataLines.join('\n');

	return {
		event,
		data: parseEventData(rawData),
		rawData,
		...(id !== undefined ? { id } : {}),
		...(retry !== undefined ? { retry } : {}),
	};
};

export const createSseParser = (onEvent: (event: sseEventType) => void) => {
	let buffer = '';

	const dispatchFrame = (frame: string) => {
		const event = parseSseEvent(frame);
		if (event) onEvent(event);
	};

	const drainBuffer = () => {
		while (true) {
			const match = buffer.match(DELIMITER_PATTERN);
			if (!match || match.index === undefined) return;

			const frame = buffer.slice(0, match.index);
			buffer = buffer.slice(match.index + match[0].length);
			dispatchFrame(frame);
		}
	};

	return {
		push(chunk: string) {
			buffer += chunk;
			drainBuffer();
		},
		end() {
			if (!buffer) return;
			dispatchFrame(buffer);
			buffer = '';
		},
	};
};

interface SseService {
	computeURL: (endpoint?: string) => string;
	computeHeaders: (headers?: Record<string, string>) => Record<string, string>;
}

class SseService {
	constructor(props) {
		this.computeURL = props.computeURL;
		this.computeHeaders = props.computeHeaders;
	}

	computeStreamURL(endpoint = '', params = {}) {
		const url = new URL(this.computeURL(endpoint));

		Object.keys(params || {})
			.filter(key => params[key] !== undefined && params[key] !== null && params[key] !== false)
			.forEach(key => {
				const value = params[key];

				if (Array.isArray(value)) {
					value.forEach(item => url.searchParams.append(key, String(item)));
					return;
				}

				url.searchParams.append(key, String(value));
			});

		return url.toString();
	}

	async streamSse({ endpoint, headers, params = {}, signal, onOpen, onEvent }: streamQueryType) {
		const computedUrl = this.computeStreamURL(endpoint, params);
		const computedHeaders = this.computeHeaders(headers);
		const response = await fetch(computedUrl, { headers: computedHeaders, signal });

		if (!response.ok) {
			const detail = await response.text().catch(() => null);
			const error = new Error(detail || `SSE request failed with status ${response.status}.`);
			error.name = 'StreamError';
			error['status'] = response.status;
			throw error;
		}

		if (!response.body) {
			const error = new Error('SSE response body was empty.');
			error.name = 'StreamError';
			error['status'] = response.status || 500;
			throw error;
		}

		onOpen?.();

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		const parser = createSseParser(onEvent);

		try {
			while (true) {
				const { value, done } = await reader.read();

				if (done) {
					parser.push(decoder.decode());
					parser.end();

					if (!signal?.aborted) {
						const error = new Error('Stream closed unexpectedly.');
						error.name = 'StreamError';
						error['status'] = 502;
						throw error;
					}

					return;
				}

				parser.push(decoder.decode(value, { stream: true }));
			}
		} finally {
			reader.releaseLock();
		}
	}
}

export { SseService };
