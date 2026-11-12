import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createChatTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, chat: options.chat });
	const response = sdkEnvelope(await context.workspaceResource.templates.createFromChat(identifier(options.chat)));
	assertOperationSucceeded(response, target);
	return response;
};

export const getChatTemplateDraft = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.templates.draftFromChat(identifier(options.chat)));
};

export const getChatTemplateSetup = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.chats.templateSetup(identifier(options.chat)));
};

export const getChatTemplateSetupItem = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(
		await context.workspaceResource.chats.templateSetupItem(identifier(options.chat), options.category, options.key),
	);
};

export const importChatTemplateResources = async (options: any) => {
	const context = await workspaceContext(options);
	const data = await input(options, ['category', 'keys', 'acknowledgment', 'idempotencyKey']);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		chat: options.chat,
		category: data.category,
		keys: data.keys,
	});
	await confirm(options, `Import selected template resources into the Chat: ${target}?`);
	const response = sdkEnvelope(
		await context.workspaceResource.chats.importTemplateResources(identifier(options.chat), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
