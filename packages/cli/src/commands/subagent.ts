import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const subagentOperation = (operation: string) => async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const owner = identifier(options.owner, '--owner');
	if (!['chat', 'agent', 'project'].includes(options.kind))
		throw new CliError(422, 'Provide --kind chat, agent, or project.');
	const collection =
		options.kind === 'chat'
			? workspaceResource.chats.subagents(owner)
			: options.kind === 'agent'
				? workspaceResource.agents.reference(owner).subagents
				: (await workspaceResource.projects.get(owner)).subagents;
	if (operation === 'list') return sdkList(await collection.list(listParams(options)));
	if (operation === 'create')
		return sdkEnvelope(
			await collection.create(
				await input(options, [
					'idempotencyKey',
					'name',
					'description',
					'instructions',
					'modelId',
					'deliveryMode',
					'skillIds',
					'resourceSelection',
					'agentScope',
					'temporary',
				]),
			),
		);
	const id = identifier(options.subagent, '--subagent');
	if (operation === 'cancel-task')
		return sdkEnvelope(await collection.cancelTask(id, identifier(options.task, '--task')));
	if (operation === 'get') return sdkEnvelope(await collection.get(id));
	if (operation === 'tasks') return sdkList(await collection.tasks(id, listParams(options)));
	if (operation === 'update')
		return sdkEnvelope(
			await collection.update(
				id,
				await input(options, [
					'revision',
					'action',
					'name',
					'description',
					'instructions',
					'modelId',
					'deliveryMode',
					'skillIds',
					'resourceSelection',
					'agentScope',
				]),
			),
		);
	if (!options.yes) throw new CliError(422, 'Review the Sub-agent and its revision, then confirm deletion with --yes.');
	const data = await input(options, ['revision']);
	return sdkEnvelope(await collection.delete(id, data.revision));
};
