import { workspaceContext } from 'src/services/command-context';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateWorkspace = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace';
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['thumbnail', 'name', 'tagline', 'description', 'visibility', 'urls']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
