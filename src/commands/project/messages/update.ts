import { projectExistingMessageContext } from 'src/services/conversation-context';
import { input, integerOption } from 'src/utils/cli-input';
import { validateMessage } from 'src/utils/message-input';
export const updateMessage = async (options: any) => {
	integerOption(options.message, 'message', 1);
	const data = validateMessage(await input(options, ['text', 'queuedMode', 'queuedModelId']), true);
	const context = await projectExistingMessageContext(options);
	return context.client.request(context.messageUrl, 'PUT', data);
};
