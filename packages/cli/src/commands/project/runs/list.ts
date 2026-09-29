import { projectContext } from 'src/services/command-context';
import { identifier, integerOption, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';
export const listRuns = async (options: any) => {
	const params = listParams(options, { search: false, pageSizeMax: 100 });
	if (options.message !== undefined) params.messageId = integerOption(options.message, 'message', 1);
	if (options.branch !== undefined) params.branchId = integerOption(options.branch, 'branch', 1);
	if (options.conversation !== undefined) params.conversationId = identifier(options.conversation, '--conversation');
	const context = await projectContext(options);
	return sdkList(await context.projectResource.runs.list(params));
};
