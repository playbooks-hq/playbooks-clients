import { projectMessageContext } from 'src/services/conversation-context';
import { messageParams } from 'src/utils/message-input';
export const listMessages = async (options: any) => {
	const params = { ...messageParams(options), cursor: 'latest', environment: 'sandbox' };
	const context = await projectMessageContext(options);
	return context.client.request(context.messagePath, 'GET', undefined, params);
};
