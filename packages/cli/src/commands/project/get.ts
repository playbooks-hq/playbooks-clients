import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams } from 'src/utils/cli-input';

export const getProject = async (options: any) => {
	const params = includeParams(options, ['folder', 'type', 'projectOwner', 'branches', 'deploy']);
	const id = identifier(options.project, '--project');
	const context = await workspaceContext(options);
	const { client } = context;
	return client.projects.get(id, params);
};
