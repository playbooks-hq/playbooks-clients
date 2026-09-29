import { workspaceConversationContext } from 'src/services/conversation-context';
import { integerOption, listParams, zeroBasedPage } from 'src/utils/cli-input';
export const listRuns = async (options: any) => {
	const params = listParams(options, { search: false, pageBase: 1, pageSizeMax: 100 });
	if (options.message !== undefined) params.messageId = integerOption(options.message, 'message', 1);
	const context = await workspaceConversationContext(options);
	params.conversationId = context.conversation.uuid;
	return zeroBasedPage(await context.client.request('/workspace/operator/runs', 'GET', undefined, params));
};
