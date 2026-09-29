import { workspaceConversationContext } from 'src/services/conversation-context';
import { integerOption, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';
export const listRuns = async (options: any) => {
	const params = listParams(options, { search: false, pageSizeMax: 100 });
	if (options.message !== undefined) params.messageId = integerOption(options.message, 'message', 1);
	const context = await workspaceConversationContext(options);
	params.conversationId = context.conversation.uuid;
	return sdkList(await context.workspaceResource.runs.list(params));
};
