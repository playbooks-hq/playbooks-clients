import { projectContext } from 'src/services/command-context';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const createProjectDesign = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources/library/designs`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['name', 'files']);
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
