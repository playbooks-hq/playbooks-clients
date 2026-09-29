import { CliClient } from 'src/services/cli-client';
import { identifier, includeParams, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listTemplates = async (options: any) => {
	const params = {
		...listParams(options, { sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['categories', 'license', 'stats']),
	};
	if (options.category !== undefined) params.category = identifier(options.category, '--category');
	if (options.type !== undefined) params.projectType = identifier(options.type, '--type');
	const client = new CliClient();
	return sdkList(await client.templates.list(params));
};
