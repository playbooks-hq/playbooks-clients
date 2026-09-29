import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows/${identifier(options['workflow'])}`;
	const params = {};
	const data = await input(options, ['name', 'status', 'steps', 'revision']);
	await confirm(options, 'Update saved workflow steps.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
