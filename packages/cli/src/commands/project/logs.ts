import { projectContext } from 'src/services/command-context';
import { integerOption, listParams, textOption } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const logsOperations = async (options: any) => {
	const params = listParams(options, { pagination: false });
	if (options['page-size'] !== undefined) params.pageSize = integerOption(options['page-size'], 'page-size', 1, 100);
	if (options.cursor !== undefined) params.cursor = textOption(options.cursor, 'cursor');
	const context = await projectContext(options);
	return sdkList(await context.projectResource.logs.list(params));
};
