import { projectContext } from 'src/services/command-context';
import { identifier, integerOption, listParams, zeroBasedPage } from 'src/utils/cli-input';
export const listRuns = async (options: any) => {
	const params = listParams(options, { search: false, pageBase: 1, pageSizeMax: 100 });
	if (options.message !== undefined) params.messageId = integerOption(options.message, 'message', 1);
	if (options.branch !== undefined) params.branchId = integerOption(options.branch, 'branch', 1);
	if (options.conversation !== undefined) params.conversationId = identifier(options.conversation, '--conversation');
	const context = await projectContext(options);
	return zeroBasedPage(await context.client.request(`${context.path}/operator/runs`, 'GET', undefined, params));
};
