import { randomUUID } from 'node:crypto';

import { CliError } from 'src/services/cli-client';
import { workspaceConversationContext } from 'src/services/conversation-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { validateMessage } from 'src/utils/message-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const createMessage = async (options: any) => {
	const data = validateMessage(
		await input(options, ['text', 'mode', 'modelId', 'deliveryMode', 'replyToMessageId', 'idempotencyKey']),
	);
	const context = await workspaceConversationContext(options);
	await confirm(
		options,
		`Submit to conversation ${context.conversation.uuid}? This may start or steer execution and incur usage.`,
	);
	data.idempotencyKey ||= randomUUID();
	try {
		return sdkEnvelope(await context.messages.create(data));
	} catch (error) {
		if (error instanceof CliError && error.status >= 500)
			throw new CliError(
				error.status,
				`${error.message} Retry the identical data with idempotencyKey ${JSON.stringify(data.idempotencyKey)}.`,
				error.source,
				error.debug,
				error.title,
			);
		throw error;
	}
};
