import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const addCollaborator = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/collaborators`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['userId', 'role']);
	await confirm(options, 'Grant Project access to an existing Workspace member.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
