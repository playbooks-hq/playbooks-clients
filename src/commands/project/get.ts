import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const getProject = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/projects/${identifier(options.project ?? context.state.project)}`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
