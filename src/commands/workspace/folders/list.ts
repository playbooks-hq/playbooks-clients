import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listFolders = async (options: any) => {
	const params = listParams(options, { pageSizeMax: 100 });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/project-folders';
	return client.request(path, 'GET', undefined, params, true);
};
