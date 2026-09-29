import { workspaceContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const addDomain = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/domains';
	const params = {};
	const data = await input(options, ['name']);
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
