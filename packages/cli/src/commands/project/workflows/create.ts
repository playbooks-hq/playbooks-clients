import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const createWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows`;
	const params = {};
	const data = await input(options, ['name', 'status', 'steps', 'schedule']);
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
