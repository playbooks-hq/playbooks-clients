import { projectConversationContext } from 'src/services/conversation-context';
export const getConversation = async (options: any) => (await projectConversationContext(options)).response;
