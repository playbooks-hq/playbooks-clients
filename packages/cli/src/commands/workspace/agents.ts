import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listWorkspaceChats = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(await workspaceResource.agents.list({ ...listParams(options), archived: Boolean(options.archived) }));
};
export const getWorkspaceChat = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(
		await workspaceResource.agents.get(identifier(options.agent), {
			...(options.conversation ? { conversationId: identifier(options.conversation) } : {}),
			configuration: Boolean(options.configuration),
		}),
	);
};
export const createWorkspaceChat = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const data = await input(options, ['name', 'idempotencyKey', 'composerOverrides', 'designSelection', 'blankStart']);
	return sdkEnvelope(await workspaceResource.agents.create(data));
};
export const updateWorkspaceChat = async (options: any) => {
	const { workspaceResource, workspaceUuid } = await workspaceContext(options);
	const agent = identifier(options.agent);
	const data = await input(options, [
		'revision',
		'action',
		'name',
		'composerOverrides',
		'resourceSelection',
		'designSelection',
		'conversationId',
		'confirmation',
	]);
	if (['archive', 'delete'].includes(data.action))
		await confirm(
			options,
			`${data.action} Agent ${agent} in Workspace ${workspaceUuid}? Its schedules will be blocked.`,
		);
	return sdkEnvelope(await workspaceResource.agents.update(agent, data));
};
export const listWorkspaceChatConversations = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(await workspaceResource.agents.conversations(identifier(options.agent)).list());
};
export const createWorkspaceChatConversation = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const data = await input(options, ['title', 'idempotencyKey']);
	return sdkEnvelope(await workspaceResource.agents.conversations(identifier(options.agent)).create(data));
};
export const listSavedAssets = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(await workspaceResource.savedAssets.list(listParams(options, { search: false })));
};
export const saveAsset = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(
		await workspaceResource.savedAssets.save(identifier(options.conversation), identifier(options.asset)),
	);
};
export const removeSavedAsset = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(
		await workspaceResource.savedAssets.remove(identifier(options.conversation), identifier(options.asset)),
	);
};
