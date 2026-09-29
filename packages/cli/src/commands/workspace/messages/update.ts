import { workspaceConversationContext } from 'src/services/conversation-context';
import { input, integerOption } from 'src/utils/cli-input';
import { validateMessage } from 'src/utils/message-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const updateMessage = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const data = validateMessage(await input(options, ['text', 'queuedMode', 'queuedModelId']), true);
	const context = await workspaceConversationContext(options);
	return sdkEnvelope(await context.messages.update(id, data));
};
