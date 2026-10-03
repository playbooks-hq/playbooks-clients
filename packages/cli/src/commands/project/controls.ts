import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { projectExistingMessageContext } from 'src/services/conversation-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, integerOption } from 'src/utils/cli-input';
import { validateMessage } from 'src/utils/message-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getRunControl = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(await projectResource.runs.control(integerOption(options.run, 'run', 1)));
};
export const cancelRun = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const id = integerOption(options.run, 'run', 1);
	await confirm(
		options,
		`Stop run ${id} in ${projectResource.uuid}? Wait for terminal acknowledgement before replacing it.`,
	);
	return sdkEnvelope(await projectResource.runs.cancel(id));
};
export const replaceRun = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const id = integerOption(options.run, 'run', 1);
	const data = validateMessage(
		await input(options, ['text', 'mode', 'modelId', 'deliveryMode', 'maxCredits', 'idempotencyKey', 'attachments']),
	);
	if (!data.idempotencyKey) throw new CliError(422, 'Replacement requires an idempotencyKey.');
	await confirm(
		options,
		`Replace turn for run ${id} in ${projectResource.uuid}? History is retained; current working-copy state and prior side effects are not undone. This may incur usage.`,
	);
	return sdkEnvelope(await projectResource.runs.replace(id, data));
};
export const createConversation = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const data = await input(options, ['branchId']);
	data.branchId = integerOption(data.branchId, 'branchId', 1);
	return sdkEnvelope(await projectResource.conversations.create(data));
};
export const forkConversation = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const id = identifier(options.conversation, '--conversation');
	const data = await input(options, ['submissionKey', 'throughMessageId', 'branchId']);
	await confirm(
		options,
		`Fork conversation ${id} within ${projectResource.uuid}? This summarizes saved context into a new chat, starts no run, and may incur summarization usage.`,
	);
	return sdkEnvelope(await projectResource.conversations.fork(id, data));
};
export const respondToMessage = async (options: any) => {
	const context = await projectExistingMessageContext(options);
	const data = await input(options, ['idempotencyKey', 'parts', 'text', 'maxCredits']);
	await confirm(
		options,
		`Respond to prompt ${context.messageId} in ${context.conversation.uuid}? This may approve or resume execution.`,
	);
	return sdkEnvelope(await context.messages.respond(context.messageId, data));
};
