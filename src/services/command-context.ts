import { CliClient, CliError } from 'src/services/cli-client';
import { CliContext } from 'src/services/cli-context';
import { identifier } from 'src/utils/cli-input';

export const authenticated = async (options: any) => {
	const store = new CliContext(options.config);
	const token = await store.token();
	if (!token) throw new CliError(401, 'Sign in with playbooks login or set PLAYBOOKS_TOKEN.');
	if (/^pb_(sand|prod)_/.test(token))
		throw new CliError(401, 'Application keys cannot authenticate the CLI. Use a developer API key.');
	return { store, token, client: new CliClient(token) };
};

export const workspaceContext = async (options: any) => {
	const { store, token } = await authenticated(options);
	const state = await store.read();
	if (!state.workspace) throw new CliError(422, 'Select a Workspace with playbooks workspace use --workspace <id>.');
	const client = new CliClient(token, state.workspace);
	const workspace = await client.request('/workspace');
	if (workspace.data.uuid !== state.workspace)
		throw new CliError(403, 'The server did not resolve the selected Workspace.');
	return { store, state, client, workspace };
};

export const projectContext = async (options: any) => {
	const context = await workspaceContext(options);
	const id = identifier(options.project ?? context.state.project);
	const path = `/workspace/projects/${id}`;
	const project = await context.client.request(path);
	return { ...context, path, project };
};
