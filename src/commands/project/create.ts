import { workspaceContext } from 'src/services/command-context';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const createProject = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/projects';
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['name', 'description', 'typeId', 'folderId']);
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
