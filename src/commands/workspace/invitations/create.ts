import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const createInvitation = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/access-invitations';
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['email', 'role']);
	await confirm(options, 'Invite a Workspace member.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
