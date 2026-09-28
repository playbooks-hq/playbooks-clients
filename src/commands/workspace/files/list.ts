import { workspaceContext } from 'src/services/command-context';
import { availableParams, listParams } from 'src/utils/cli-input';

export const listWorkspaceFiles = async (options: any) => {
	const params = { ...listParams(options, { pageSizeMax: 100 }), ...availableParams(options) };
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/files';
	return client.request(path, 'GET', undefined, params, true);
};
