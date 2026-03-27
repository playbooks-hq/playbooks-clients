import { spawn } from 'node:child_process';

function getOpenUrlCommand(url: string) {
	switch (process.platform) {
		case 'darwin':
			return { command: 'open', args: [url] };
		case 'win32':
			return { command: 'cmd', args: ['/c', 'start', '', url] };
		default:
			return { command: 'xdg-open', args: [url] };
	}
}

export async function openUrl(url: string) {
	const { command, args } = getOpenUrlCommand(url);

	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, { detached: true, stdio: 'ignore' });

		child.once('error', reject);
		child.once('spawn', () => {
			child.unref();
			resolve();
		});
	});
}
