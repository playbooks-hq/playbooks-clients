import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateCollaborator = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/collaborators/${identifier(options['collaborator'])}`;
	const params = {};
	const data = await input(options, ['role']);
	await confirm(options, 'Update Project collaborator access.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
