import { projectContext } from 'src/services/command-context';
import { availableParams, listParams } from 'src/utils/cli-input';

export const listProjectFiles = async (options: any) => {
	const params = { ...listParams(options, { pageSizeMax: 100 }), ...availableParams(options) };
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/files`;
	return client.request(path, 'GET', undefined, params, true);
};
