import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams, zeroBasedPage } from 'src/utils/cli-input';

export const settlementsOperations = async (options: any) => {
	const params = listParams(options, { pageBase: 1, sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/settlements';
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};

export const settlementOperations = async (settlementId: string, options: any) => {
	const id = identifier(settlementId);
	const { client } = await workspaceContext(options);
	return client.request(`/workspace/settlements/${id}`, 'GET', undefined, undefined, true);
};
