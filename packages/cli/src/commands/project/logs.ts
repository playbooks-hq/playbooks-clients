import { projectContext } from 'src/services/command-context';
import { integerOption, listParams, textOption } from 'src/utils/cli-input';

export const logsOperations = async (options: any) => {
	const params = listParams(options, { pagination: false });
	if (options.limit !== undefined) params.limit = integerOption(options.limit, 'limit', 1, 500);
	if (options.cursor !== undefined) params.cursor = textOption(options.cursor, 'cursor');
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/logs`;
	return client.request(path, 'GET', undefined, params, true);
};
