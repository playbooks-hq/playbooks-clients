import { projectMessageContext } from 'src/services/conversation-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { validateMessage } from 'src/utils/message-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const createMessage = async (options: any) => {
	const data = validateMessage(
		await input(options, [
			'text',
			'mode',
			'modelId',
			'deliveryMode',
			'replyToMessageId',
			'maxCredits',
			'idempotencyKey',
			'attachments',
		]),
	);
	const context = await projectMessageContext(options);
	await confirm(
		options,
		`Submit to conversation ${context.conversation.uuid}? This may start or steer execution and incur usage.`,
	);
	return sdkEnvelope(await context.messages.create(data));
};
