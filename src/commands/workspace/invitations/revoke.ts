import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const revokeInvitation = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/access-invitations/${identifier(options['invitation'])}`;
	const params = {};
	await confirm(options, 'Revoke a pending invitation.: ' + path + '?');
	const response = await client.request(path, 'DELETE', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
