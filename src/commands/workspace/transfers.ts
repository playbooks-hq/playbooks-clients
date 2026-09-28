import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const transfersOperations = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/transfers';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
