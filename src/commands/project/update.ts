import { workspaceContext } from 'src/services/command-context';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateProject = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/projects/${identifier(options.project ?? context.state.project)}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['name', 'description', 'thumbnail', 'typeId']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
