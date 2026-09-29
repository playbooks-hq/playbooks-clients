import enquirer from 'enquirer';
import { CliError } from 'src/services/cli-client';
import { authenticated } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const useWorkspace = async (options: any) => {
	let id = options.workspace;
	const { store, client, token } = await authenticated(options);
	if (id === undefined) {
		if (!process.stdin.isTTY || options.json)
			throw new CliError(422, 'Provide a Workspace identifier with --workspace.');
		const response = await client.workspaces.list();
		const answer: any = await enquirer.prompt({
			type: 'select',
			name: 'workspace',
			message: 'Workspace',
			choices: response.data.map(item => ({ name: item.uuid, message: `${item.name} (${item.uuid})` })),
		});
		id = answer.workspace;
	}
	id = identifier(id, '--workspace');
	const response = sdkEnvelope(await client.workspaces.get(id));
	if (response.data.uuid !== id) throw new CliError(403, 'The requested Workspace could not be resolved.');
	await store.write({ version: 1, workspace: id });
	return response;
};
