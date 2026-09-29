import enquirer from 'enquirer';
import { CliClient, CliError } from 'src/services/cli-client';
import { CliContext } from 'src/services/cli-context';
import { readStdin } from 'src/utils/cli-input';

export const login = async (options: any) => {
	const store = new CliContext(options.config);
	let token = process.env.PLAYBOOKS_TOKEN;
	if (options['token-stdin']) {
		if (process.stdin.isTTY) throw new CliError(422, '--token-stdin requires piped input.');
		token = (await readStdin()).trim();
	} else if (!token && process.stdin.isTTY && !options.json) {
		console.error('Browser handoff is not available yet. Create a developer key in Account settings.');
		const answer: any = await enquirer.prompt({ type: 'password', name: 'token', message: 'Developer API key' });
		token = answer.token;
	}
	if (!token)
		throw new CliError(
			401,
			'Set PLAYBOOKS_TOKEN or pipe a developer key to login --token-stdin. Browser handoff requires Server/App support.',
		);
	if (/^pb_(sand|prod)_/.test(token)) throw new CliError(401, 'Use a platform developer key, not an application key.');
	const session = await new CliClient(token).request('/session');
	if (options['token-stdin'] || !process.env.PLAYBOOKS_TOKEN) await store.login(token);
	else await store.write({ version: 1 });
	return { data: { authenticated: true, user: { uuid: session.data.uuid, name: session.data.name }, workspace: null } };
};
