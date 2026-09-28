import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listWorkspaceMcps = async (options: any) => {
	const params = listParams(options, { librarySort: true });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/mcps';
	return client.request(path, 'GET', undefined, params, true);
};
