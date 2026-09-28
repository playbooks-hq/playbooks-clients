import { CliClient } from 'src/services/cli-client';
import { identifier, includeParams, listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listTemplates = async (options: any) => {
	const params = {
		...listParams(options, { pageBase: 1, sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['categories', 'license', 'stats']),
	};
	if (options.category !== undefined) params.category = identifier(options.category, '--category');
	if (options.type !== undefined) params.projectType = identifier(options.type, '--type');
	const client = new CliClient();
	const path = '/templates';
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
