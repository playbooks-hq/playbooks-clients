import { projectContext } from 'src/services/command-context';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateProjectResources = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['revision', 'designId', 'workspaceConnectorIds']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
