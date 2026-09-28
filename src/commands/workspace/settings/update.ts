import { workspaceContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateWorkspacePreferences = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/preferences';
	const params = {};
	const data = await input(options, ['mode', 'deliveryMode', 'instructions', 'modelId', 'permissions']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
