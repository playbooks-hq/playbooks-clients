import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listWorkflows = async (options: any) => {
	const params = listParams(options, { pageSizeMax: 100 });
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows`;
	return client.request(path, 'GET', undefined, params, true);
};
