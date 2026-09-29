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
	const explicitWorkspace = options.workspace !== undefined ? identifier(options.workspace, '--workspace') : undefined;
	const { store, token } = await authenticated(options);
	const state = await store.read();
	const workspaceValue = explicitWorkspace ?? state.workspace;
	if (workspaceValue === undefined)
		throw new CliError(422, 'Provide --workspace <id> or select a workspace with playbooks workspace use.');
	const workspaceUuid = identifier(workspaceValue, '--workspace');
	const client = new CliClient(token, workspaceUuid);
	const workspace = await client.workspaces.get();
	if (workspace.data.uuid !== workspaceUuid)
		throw new CliError(403, 'The server did not resolve the requested workspace.');
	return { store, state, client, workspace, workspaceUuid };
};

export const projectContext = async (options: any) => {
	const id = identifier(options.project, '--project');
	const context = await workspaceContext(options);
	const path = `/workspace/projects/${id}`;
	const project = await context.client.projects.get(id);
	return { ...context, path, project };
};
