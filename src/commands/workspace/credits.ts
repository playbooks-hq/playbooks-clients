import { workspaceContext } from 'src/services/command-context';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const creditsOperations = async (options: any) => {
	const params = listParams(options, { pageBase: 1, sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/credits';
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
