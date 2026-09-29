import { output, redact } from 'src/utils/cli-output';
import { terminalText } from 'src/utils/terminal-text';

export const outputMessages = (response: any, options: any) => {
	if (options.json || options.select || !process.stdout.isTTY) return output(response, options);
	const records = Array.isArray(response.data) ? response.data : [response.data];
	if (!records.length) console.log('No messages.');
	for (const item of records) {
		const message = redact(item);
		const text = [`[${message.id}] ${message.role} (${message.status})`, message.text || '', ''].join('\n');
		console.log(terminalText(text));
	}
	if (response.meta?.hasMore) console.log(`More messages: use --before ${response.meta.nextCursor}.`);
};
