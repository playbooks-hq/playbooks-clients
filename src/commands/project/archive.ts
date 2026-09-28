import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const archiveProject = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/lifecycle/archive`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['confirmation']);
	await confirm(options, 'Archive the selected Project.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
