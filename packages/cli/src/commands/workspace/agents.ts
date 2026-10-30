import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listChannels = async (options: any) => {
	if (options.agent) {
		const { workspaceResource } = await workspaceContext(options);
		return sdkList(await workspaceResource.agents.channels(identifier(options.agent)).list());
	}
	const { projectResource } = await projectContext(options);
	return sdkList(await projectResource.channels.list());
};

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
export const workingFiles = async (options: any, operation = 'get') => {
	const { workspaceResource } = await workspaceContext(options);
	const files = workspaceResource.agents.workingFiles(identifier(options.agent));
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
