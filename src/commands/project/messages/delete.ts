import { projectExistingMessageContext } from 'src/services/conversation-context';
import { confirm } from 'src/utils/cli-confirm';
import { integerOption } from 'src/utils/cli-input';
export const deleteMessage = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const context = await projectExistingMessageContext(options);
	await confirm(
		options,
		`Cancel queued message ${id} in conversation ${context.conversation.uuid}? History is retained.`,
	);
	return context.client.request(context.messageUrl, 'DELETE');
};
