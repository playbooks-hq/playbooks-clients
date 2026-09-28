import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listInvitations = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/access-invitations';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
