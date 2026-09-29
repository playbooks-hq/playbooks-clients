import { workspaceConversationContext } from 'src/services/conversation-context';
import { integerOption } from 'src/utils/cli-input';
export const getMessage = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const context = await workspaceConversationContext(options);
	return context.client.request(`${context.conversationPath}/messages/${id}`);
};
