import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const deleteProject = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/lifecycle/delete`;
	const params = {};
	const data = await input(options, ['confirmation']);
	await confirm(options, 'Permanently delete the project.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
