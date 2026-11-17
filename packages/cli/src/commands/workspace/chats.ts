import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext, workspaceReferenceContext } from 'src/services/command-context';
import { projectConversationContext, workspaceConversationContext } from 'src/services/conversation-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, integerOption, listParams, textOption } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listChannels = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkList(await projectResource.channels.list());
};

export const listWorkspaceChats = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(await workspaceResource.chats.list({ ...listParams(options), archived: Boolean(options.archived) }));
};
export const getWorkspaceChat = async (options: any) => {
	const { workspaceReference } = await workspaceReferenceContext(options);
	return sdkEnvelope(await workspaceReference.chats.get(identifier(options.chat)));
};
export const createWorkspaceChat = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const data = await input(options, ['name', 'idempotencyKey']);
	return sdkEnvelope(await workspaceResource.chats.create(data));
};
export const updateWorkspaceChat = async (options: any) => {
	const { workspaceReference, workspaceUuid } = await workspaceReferenceContext(options);
	const chat = identifier(options.chat);
	const data = await input(options, ['revision', 'action', 'name', 'confirmation']);
	if (['archive', 'delete'].includes(data.action))
		await confirm(
			options,
			`${data.action} Chat ${chat} in Workspace ${workspaceUuid}? Its schedules will be ${data.action === 'delete' ? 'deleted' : 'paused'}.`,
		);
	return sdkEnvelope(await workspaceReference.chats.update(chat, data));
};
export const fileSystem = async (options: any, operation = 'get') => {
	const { workspaceReference } = await workspaceReferenceContext(options);
	const files = workspaceReference.chats.fileSystem(identifier(options.chat));
	if (operation === 'download') {
		if (typeof options.output !== 'string')
			throw new CliError(422, 'Provide a destination with --output. Existing files are never overwritten.');
		const response = await files.download();
		await writeFile(options.output, response, { flag: 'wx', mode: 0o600 });
		return { data: { path: options.output, bytes: response.length } };
	}
	return sdkEnvelope(
		operation === 'get'
			? await files.get()
			: await files[operation](await input(options, ['revision', 'files', 'path', 'entryPoint', 'name', 'requestId'])),
	);
};
export const conversationPlans = async (options: any, operation: 'get' | 'create' | 'revise') => {
	if (options.chat !== undefined && options.project !== undefined)
		throw new CliError(422, 'Choose either --chat or --project.');
	const { conversationResource } = await (options.project === undefined
		? workspaceConversationContext(options)
		: projectConversationContext(options));
	const plans = conversationResource.plans;
	if (operation === 'get') {
		if (options.plan === undefined) {
			if (options.revision !== undefined) throw new CliError(422, '--revision requires --plan.');
			return sdkEnvelope(await plans.current());
		}
		const revision = options.revision === undefined ? undefined : textOption(options.revision, 'revision');
		return sdkEnvelope(await plans.get(identifier(options.plan, '--plan'), revision));
	}
	if (operation === 'create') return sdkEnvelope(await plans.create(await input(options, ['title', 'content'])));
	return sdkEnvelope(
		await plans.revise(identifier(options.plan, '--plan'), await input(options, ['revision', 'content'])),
	);
};

export const readChatConversation = async (options: any) => {
	identifier(options.chat, '--chat');
	const throughMessageId = integerOption(options['through-message-id'], 'through-message-id', 0);
	const observedAt = textOption(options['observed-at'], 'observed-at');
	const { conversationResource } = await workspaceConversationContext(options);
	return sdkEnvelope(await conversationResource.markRead({ throughMessageId, observedAt }));
};
