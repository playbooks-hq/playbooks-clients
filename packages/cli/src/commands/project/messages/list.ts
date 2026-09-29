import { projectMessageContext } from 'src/services/conversation-context';
import { messageParams } from 'src/utils/message-input';
import { sdkList } from 'src/utils/sdk-output';
export const listMessages = async (options: any) => {
	const params = messageParams(options);
	const context = await projectMessageContext(options);
	return sdkList(await context.messages.list(params));
};
