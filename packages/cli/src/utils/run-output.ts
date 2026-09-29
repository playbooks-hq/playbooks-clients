import { clearScreenDown, cursorTo, moveCursor } from 'node:readline';

import { redact } from 'src/utils/cli-output';
import { terminalText } from 'src/utils/terminal-text';

export const runOutput = (options: any, signal: AbortSignal) => {
	const structured = options.json || !process.stdout.isTTY;
	let displayed = '';
	let text = '';
	return async (event: { event: string; data: any }) => {
		const safe = redact(event);
		if (structured) {
			await new Promise<void>((resolve, reject) => {
				if (signal.aborted) return reject(signal.reason);
				const abort = () => reject(signal.reason);
				signal.addEventListener('abort', abort, { once: true });
				process.stdout.write(JSON.stringify(safe) + '\n', error => {
					signal.removeEventListener('abort', abort);
					if (error) reject(error);
					else resolve();
				});
			});
			return;
		}
		const payload = safe.data;
		if (payload?.type === 'text-delta') {
			text += payload.delta || payload.textDelta || '';
		}
		if (payload?.type === 'data-conversation-message-snapshot') {
			text =
				payload.data?.text ||
				(payload.data?.parts || [])
					.filter((part: any) => part.type === 'text')
					.map((part: any) => part.text || '')
					.join('\n');
		}
		// Remote text must not inject terminal control sequences.
		text = terminalText(text);
		if (text === displayed) return;
		if (text.startsWith(displayed)) process.stdout.write(text.slice(displayed.length));
		else {
			const width = process.stdout.columns || 80;
			const rows =
				displayed.split('\n').reduce((total, line) => total + Math.floor(Math.max(0, line.length - 1) / width), 0) +
				displayed.split('\n').length -
				1;
			cursorTo(process.stdout, 0);
			if (rows) moveCursor(process.stdout, 0, -rows);
			clearScreenDown(process.stdout);
			process.stdout.write(text);
		}
		displayed = text;
	};
};
