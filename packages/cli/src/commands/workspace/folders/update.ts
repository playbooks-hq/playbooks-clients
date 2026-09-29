import { workspaceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateFolder = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/project-folders/${identifier(options['folder'])}`;
	const params = {};
	const data = await input(options, ['name', 'description']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
