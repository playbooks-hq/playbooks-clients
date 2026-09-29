import { PlaybooksError } from './error.js';

export const readEvents = async function* (body: ReadableStream<Uint8Array>, activity: () => void) {
	const reader = body.getReader();
	const decoder = new TextDecoder('utf-8', { fatal: true });
	let pending = '';
	let event = '';
	let data: string[] = [];
	let size = 0;
	try {
		for (;;) {
			const chunk = await reader.read();
			if (!chunk.done) activity();
			pending += decoder.decode(chunk.value, { stream: !chunk.done });
			if (pending.length + size > 8 * 1024 * 1024) throw new PlaybooksError(502, 'The server event exceeds 8 MB.');
			let match;
			while ((match = /\r\n|\r|\n/.exec(pending))) {
				if (!chunk.done && match[0] === '\r' && match.index === pending.length - 1) break;
				const line = pending.slice(0, match.index);
				pending = pending.slice(match.index + match[0].length);
				if (!line) {
					if (data.length) {
						const text = data.join('\n');
						let parsed;
						try {
							parsed = text === '[DONE]' ? text : JSON.parse(text);
						} catch {
							throw new PlaybooksError(502, 'The server returned malformed event JSON.');
						}
						yield { event: event || 'message', data: parsed };
					}
					event = '';
					data = [];
					size = 0;
					continue;
				}
				if (line.startsWith(':')) continue;
				const colon = line.indexOf(':');
				const field = colon < 0 ? line : line.slice(0, colon);
				const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
				if (field === 'event') event = value;
				if (field === 'data') {
					data.push(value);
					size += value.length;
				}
			}
			if (chunk.done) {
				if (pending.trim() || data.length) throw new PlaybooksError(502, 'The server closed an incomplete event.');
				break;
			}
		}
	} finally {
		await reader.cancel().catch(() => {});
		reader.releaseLock();
	}
};
