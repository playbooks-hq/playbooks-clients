import { CliClient, CliError } from 'src/services/cli-client';
import { CliContext } from 'src/services/cli-context';
import { authOrigin, browserSession, revokeSession } from 'src/services/cli-oauth';
import { readStdin } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const login = async (options: any) => {
	const store = new CliContext(options.config);
	let token = process.env.PLAYBOOKS_TOKEN;
	if (options['token-stdin']) {
		if (process.stdin.isTTY) throw new CliError(422, '--token-stdin requires piped input.');
		token = (await readStdin()).trim();
		if (!token) throw new CliError(422, 'Provide a developer API key on stdin.');
	}
	if (token) {
		if (/^pb_(sand|prod)_/.test(token))
			throw new CliError(401, 'Use a platform developer key, not an application key.');
		const session = sdkEnvelope(await new CliClient(token).session.get());
		if (options['token-stdin']) await store.login({ token });
		else await store.write({ version: 1 });
		return {
			data: { authenticated: true, user: { uuid: session.data.uuid, name: session.data.name }, workspace: null },
		};
	}
	if (!process.stdin.isTTY || options.json)
		throw new CliError(401, 'Sign in from an interactive terminal, or use PLAYBOOKS_TOKEN or login --token-stdin.');

	const issuer = authOrigin();
	const credentials = await browserSession(issuer);
	try {
		const session = sdkEnvelope(await new CliClient(credentials.accessToken).session.get());
		await store.login({ issuer, ...credentials });
		return {
			data: { authenticated: true, user: { uuid: session.data.uuid, name: session.data.name }, workspace: null },
		};
	} catch (error) {
		await revokeSession(issuer, credentials.refreshToken).catch(() => undefined);
		throw error;
	}
};
