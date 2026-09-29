import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext } from 'src/services/command-context';
import { identifier, integerOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const workspaceConversationContext = async (options: any) => {
	const context = await workspaceContext(options);
	const conversations = context.workspaceResource.conversations;
	const conversationResource =
		options.conversation === undefined
			? await conversations.resolve()
			: await conversations.get(identifier(options.conversation, '--conversation'));
	const response = sdkEnvelope(conversationResource);
	return {
		...context,
		conversationResource,
		conversation: response.data,
		response,
		messages: conversationResource.messages,
	};
};
export const projectConversationContext = async (options: any) => {
	const context = await projectContext(options);
	const conversations = context.projectResource.conversations;
	const conversationResource =
		options.conversation === undefined
			? await conversations.resolve()
			: await conversations.get(identifier(options.conversation, '--conversation'));
	const response = sdkEnvelope(conversationResource);
	return { ...context, conversationResource, conversation: response.data, response };
};
export const projectMessageContext = async (options: any) => {
	if (options.branch !== undefined) integerOption(options.branch, 'branch', 1);
	const context = await projectConversationContext(options);
	const branch = options.branch ?? context.conversation.latestBranchId;
	if (branch === undefined || branch === null)
		throw new CliError(422, 'This conversation has no current branch. Provide --branch from project branches.');
	const branchResource = await context.conversationResource.branches.get(integerOption(branch, 'branch', 1));
	return { ...context, messages: branchResource.messages };
};
export const projectExistingMessageContext = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const context = await projectMessageContext(options);
	const message = sdkEnvelope(await context.messages.get(id));
	return { ...context, message, messageId: id };
};
