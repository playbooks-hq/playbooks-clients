import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
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
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(await workspaceResource.chats.get(identifier(options.chat)));
};
export const createWorkspaceChat = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const data = await input(options, ['name', 'idempotencyKey']);
	return sdkEnvelope(await workspaceResource.chats.create(data));
};
export const updateWorkspaceChat = async (options: any) => {
	const { workspaceResource, workspaceUuid } = await workspaceContext(options);
	const chat = identifier(options.chat);
	const data = await input(options, ['revision', 'action', 'name', 'confirmation']);
	if (['archive', 'delete'].includes(data.action))
		await confirm(
			options,
			`${data.action} Chat ${chat} in Workspace ${workspaceUuid}? Its schedules will be ${data.action === 'delete' ? 'deleted' : 'paused'}.`,
		);
	return sdkEnvelope(await workspaceResource.chats.update(chat, data));
};
export const workingFiles = async (options: any, operation = 'get') => {
	const { workspaceResource } = await workspaceContext(options);
	const files = workspaceResource.chats.workingFiles(identifier(options.chat));
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
export const conversationPlans = async (options: any, operation = 'get') => {
	const { workspaceResource } = await workspaceContext(options);
	const plans = workspaceResource.conversationPlans(
		identifier(options.conversation),
		options.project ? identifier(options.project) : undefined,
	);
	if (operation === 'get')
		return sdkEnvelope(
			options.plan ? await plans.get(identifier(options.plan), options.revision) : await plans.current(),
		);
	const data = await input(options, ['title', 'content', 'revision', 'requestId']);
	return sdkEnvelope(
		operation === 'create'
			? await plans.create(data as { title: string; content: string })
			: await plans[operation](identifier(options.plan), data),
	);
};
