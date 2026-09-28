import { workspaceContext } from 'src/services/command-context';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listMembers = async (options: any) => {
	const params = listParams(options, { pageBase: 1 });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/members';
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
