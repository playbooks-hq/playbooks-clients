import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext } from 'src/services/command-context';
import { identifier, integerOption } from 'src/utils/cli-input';

export const workspaceConversationContext = async (options: any) => {
	const selected = options.conversation === undefined ? undefined : identifier(options.conversation, '--conversation');
	const context = await workspaceContext(options);
	const response = await context.client.request(
		selected ? `/workspace/conversations/${selected}` : '/workspace/conversation',
		'GET',
		undefined,
		{},
		false,
	);
	const conversation = response.data;
	if (
		String(conversation.workspaceId) !== String(context.workspace.data.id) ||
		conversation.projectId ||
		conversation.folderId
	)
		throw new CliError(403, 'The conversation does not belong to this workspace operator.');
	if (selected && conversation.uuid !== selected)
		throw new CliError(403, 'The conversation does not match the requested identifier.');
	const conversationPath = `/workspace/conversations/${identifier(conversation.uuid, '--conversation')}`;
	return { ...context, conversation, response, conversationPath };
};

export const projectConversationContext = async (options: any) => {
	const selected = options.conversation === undefined ? undefined : identifier(options.conversation, '--conversation');
	const context = await projectContext(options);
	const response = await context.client.request(
		selected ? `/workspace/conversations/${selected}` : `${context.path}/conversation`,
		'GET',
		undefined,
		{},
		false,
	);
	const conversation = response.data;
	if (String(conversation.projectId) !== String(context.project.data.id))
		throw new CliError(403, 'The conversation does not belong to this project.');
	if (selected && conversation.uuid !== selected)
		throw new CliError(403, 'The conversation does not match the requested identifier.');
	const conversationPath = `/workspace/conversations/${identifier(conversation.uuid, '--conversation')}`;
	return { ...context, conversation, response, conversationPath };
};

export const projectMessageContext = async (options: any) => {
	if (options.branch !== undefined) integerOption(options.branch, 'branch', 1);
	const context = await projectConversationContext(options);
	const branch = options.branch ?? context.conversation.latestBranchId;
	if (branch === undefined || branch === null)
		throw new CliError(422, 'This conversation has no current branch. Provide --branch from project branches.');
	const branchId = integerOption(branch, 'branch', 1);
	const messagePath = `${context.conversationPath}/branches/${branchId}/messages`;
	// Verify the branch within the already verified conversation before any mutation.
	await context.client.request(`${context.conversationPath}/branches/${branchId}`);
	return { ...context, messagePath };
};

export const projectExistingMessageContext = async (options: any) => {
	const id = integerOption(options.message, 'message', 1);
	const context = await projectMessageContext(options);
	const messageUrl = `${context.messagePath}/${id}`;
	const message = await context.client.request(messageUrl);
	if (String(message.data.conversationId) !== String(context.conversation.id) || message.data.environment !== 'sandbox')
		throw new CliError(403, 'The message does not belong to this sandbox conversation.');
	return { ...context, message, messageUrl };
};
