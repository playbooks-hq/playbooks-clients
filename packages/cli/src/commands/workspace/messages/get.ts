import { workspaceConversationContext } from 'src/services/conversation-context';
import { integerOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const getMessage = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const context = await workspaceConversationContext(options);
	return sdkEnvelope(await context.messages.get(id));
};
