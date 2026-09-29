import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateMember = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/members/${identifier(options['member'])}`;
	const params = {};
	const data = await input(options, ['memberRole']);
	await confirm(options, 'Update a Workspace member role.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
