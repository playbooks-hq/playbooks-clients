import { workspaceConversationContext } from 'src/services/conversation-context';
export const getConversation = async (options: any) => (await workspaceConversationContext(options)).response;
