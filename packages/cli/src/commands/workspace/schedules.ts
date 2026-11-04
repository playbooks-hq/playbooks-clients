import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listChatSchedules = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(
		await workspaceResource.chatSchedules.list(
			options.conversation ? { conversationId: identifier(options.conversation) } : {},
		),
	);
};
export const getChatSchedule = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(await workspaceResource.chatSchedules.get(identifier(options.schedule)));
};
export const previewChatSchedule = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const data = await input(options, ['frequency', 'weekday', 'monthDay', 'time', 'timezone']);
	return sdkEnvelope(await workspaceResource.chatSchedules.preview(data));
};
export const createChatSchedule = async (options: any) => {
	const { workspaceResource, workspaceUuid } = await workspaceContext(options);
	const data = await input(options, [
		'chatId',
		'conversationId',
		'originMessageId',
		'idempotencyKey',
		'name',
		'instructions',
		'references',
		'modelId',
		'destination',
		'destinationConversationId',
		'enabled',
		'frequency',
		'weekday',
		'monthDay',
		'time',
		'timezone',
	]);
	if (data.enabled) await confirm(options, `Enable Chat schedule execution and usage in Workspace ${workspaceUuid}?`);
	return sdkEnvelope(await workspaceResource.chatSchedules.create(data));
};
export const updateChatSchedule = async (options: any) => {
	const { workspaceResource, workspaceUuid } = await workspaceContext(options);
	const schedule = identifier(options.schedule);
	const data = await input(options, ['action', 'expectedRevision', 'changes', 'idempotencyKey']);
	if (['run', 'resume', 'delete'].includes(data.action) || data.changes?.enabled)
		await confirm(
			options,
			`Apply ${data.action} to Chat schedule ${schedule} in Workspace ${workspaceUuid}, including its execution effects and usage?`,
		);
	return sdkEnvelope(await workspaceResource.chatSchedules.update(schedule, data));
};
