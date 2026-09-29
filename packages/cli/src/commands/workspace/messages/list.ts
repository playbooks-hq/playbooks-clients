import { workspaceConversationContext } from 'src/services/conversation-context';
import { messageParams } from 'src/utils/message-input';
export const listMessages = async (options: any) => {
	const params = messageParams(options);
	const context = await workspaceConversationContext(options);
	return context.client.request(`${context.conversationPath}/messages`, 'GET', undefined, params);
};
