import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const budgetOperations = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/budget';
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
