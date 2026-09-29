import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams, listParams } from 'src/utils/cli-input';

export const listTemplates = async (options: any) => {
	const params = {
		...listParams(options, { sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['categories', 'license', 'stats']),
	};
	if (options.category !== undefined) params.category = identifier(options.category, '--category');
	if (options.type !== undefined) params.projectType = identifier(options.type, '--type');
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/templates';
	return client.request(path, 'GET', undefined, params, true);
};
