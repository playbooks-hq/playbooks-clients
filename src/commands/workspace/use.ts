import enquirer from 'enquirer';
import { CliClient, CliError } from 'src/services/cli-client';
import { authenticated } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const useWorkspace = async (options: any) => {
	let id = options.workspace;
	const { store, client, token } = await authenticated(options);
	if (id === undefined) {
		if (!process.stdin.isTTY || options.json)
			throw new CliError(422, 'Provide a Workspace identifier with --workspace.');
		const response = await client.request('/session/workspaces');
		const answer: any = await enquirer.prompt({
			type: 'select',
			name: 'workspace',
			message: 'Workspace',
			choices: response.data.map(item => ({ name: item.uuid, message: `${item.name} (${item.uuid})` })),
		});
		id = answer.workspace;
	}
	id = identifier(id, '--workspace');
	const response = await new CliClient(token, id).request('/workspace');
	if (response.data.uuid !== id) throw new CliError(403, 'The requested Workspace could not be resolved.');
	await store.write({ version: 1, workspace: id });
	return response;
};
