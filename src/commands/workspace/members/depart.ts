import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const removeMember = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/session/workspaces/${identifier(context.state.workspace)}/members/${identifier(options['member'])}/departure`;
	const params = {};
	const data = await input(options, ['revision', 'toUserId']);
	await confirm(options, 'Remove a member using the reviewed revision and ownership recipient.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
