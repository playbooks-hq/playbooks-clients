import { workspaceReferenceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createChatTemplate = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, chat: options.chat });
	const response = sdkEnvelope(await context.workspaceReference.templates.createFromChat(identifier(options.chat)));
	assertOperationSucceeded(response, target);
	return response;
};

export const getChatTemplateDraft = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return sdkEnvelope(await context.workspaceReference.templates.draftFromChat(identifier(options.chat)));
};

export const getChatTemplateSetup = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return sdkEnvelope(await context.workspaceReference.chats.templateSetup(identifier(options.chat)));
};

export const getChatTemplateSetupItem = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return sdkEnvelope(
		await context.workspaceReference.chats.templateSetupItem(identifier(options.chat), options.category, options.key),
	);
};

export const importChatTemplateResources = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	const data = await input(options, ['category', 'keys', 'acknowledgment', 'idempotencyKey']);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		chat: options.chat,
		category: data.category,
		keys: data.keys,
	});
	await confirm(options, `Import selected template resources into the Chat: ${target}?`);
	const response = sdkEnvelope(
		await context.workspaceReference.chats.importTemplateResources(identifier(options.chat), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
