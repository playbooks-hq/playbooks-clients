import { randomUUID } from 'node:crypto';

import { CliError } from 'src/services/cli-client';
import { workspaceContext, workspaceReferenceContext } from 'src/services/command-context';
import { identifier, input, integerOption, listParams, shellArgument, textOption } from 'src/utils/cli-input';
import { redact } from 'src/utils/cli-output';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

const agentContext = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return { ...context, agent: context.workspaceReference.agents.reference(identifier(options.agent, '--agent')) };
};
const confirm = (options: any, description: string) => {
	if (!options.yes) throw new CliError(422, `Review ${description}, then confirm with --yes.`);
};
export const listAgents = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	const params = {
		...listParams(options),
		...(options.status && { status: textOption(options.status, 'status') }),
		...(options.association && {
			association: textOption(options.association, 'association') as 'unassociated' | 'project' | 'site',
		}),
	};
	return sdkList(await workspaceResource.agents.list(params));
};
export const getAgent = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return sdkEnvelope(await context.workspaceReference.agents.get(identifier(options.agent, '--agent')));
};
export const getSandbox = async (options: any) => sdkEnvelope(await (await agentContext(options)).agent.sandbox.get());
export const getSandboxOperation = async (options: any) =>
	sdkEnvelope(
		await (await agentContext(options)).agent.sandbox.operation(identifier(options.operation, '--operation')),
	);
export const sandboxAction = async (options: any) => {
	const data = await input(options, ['operation', 'idempotencyKey']);
	if (!['start', 'stop', 'reset', 'remove'].includes(data.operation))
		throw new CliError(422, 'Choose start, stop, reset, or remove.');
	if (typeof data.idempotencyKey !== 'string' || !data.idempotencyKey.trim())
		throw new CliError(422, 'Provide a nonempty idempotencyKey for safe retries.');
	if (data.operation === 'reset' || data.operation === 'remove') confirm(options, `Sandbox ${data.operation}`);
	return sdkEnvelope(await (await agentContext(options)).agent.sandbox.action(data.operation, data.idempotencyKey));
};
export const createAgent = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(
		await workspaceResource.agents.create(
			await input(options, ['idempotencyKey', 'name', 'description', 'projectId', 'siteId', 'configuration']),
		),
	);
};
export const updateAgent = async (options: any) => {
	const context = await workspaceReferenceContext(options);
	return sdkEnvelope(
		await context.workspaceReference.agents.update(
			identifier(options.agent, '--agent'),
			await input(options, ['revision', 'name', 'description', 'configuration', 'projectId', 'siteId']),
		),
	);
};
export const archiveAgent = async (options: any) => {
	const agent = (await agentContext(options)).agent;
	return sdkEnvelope(await agent.archive((await input(options, ['revision'])).revision));
};
export const restoreAgent = async (options: any) => {
	const agent = (await agentContext(options)).agent;
	return sdkEnvelope(await agent.restore((await input(options, ['revision'])).revision));
};
export const deleteAgent = async (options: any) => {
	confirm(options, 'this Agent and its private state');
	const agent = (await agentContext(options)).agent;
	return sdkEnvelope(await agent.delete((await input(options, ['revision'])).revision));
};
export const listExecutions = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.executions.list(listParams(options)));
export const listConversations = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.conversations.list(listParams(options)));
export const createConversation = async (options: any) =>
	sdkEnvelope(
		await (await agentContext(options)).agent.conversations.create(await input(options, ['title', 'idempotencyKey'])),
	);
export const getConversation = async (options: any) =>
	sdkEnvelope(
		await (await agentContext(options)).agent.conversations.get(identifier(options.conversation, '--conversation')),
	);
export const conversationMessages = async (options: any) =>
	sdkList(
		await (
			await agentContext(options)
		).agent.conversations.messages(identifier(options.conversation, '--conversation'), {
			...(options.cursor && { cursor: textOption(options.cursor, 'cursor') }),
		}),
	);
export const streamConversation = async (options: any) => {
	if (options.select !== undefined) throw new CliError(422, '--select is not supported for conversation streams.');
	const timeout = integerOption(options.timeout ?? 1800, 'timeout', 1, 2147483) * 1000;
	const agentId = identifier(options.agent, '--agent');
	const conversationId = identifier(options.conversation, '--conversation');
	const context = await agentContext(options);
	await context.agent.conversations.get(conversationId);
	const inspect = `playbooks agent conversation messages --workspace ${context.workspaceUuid} --agent ${agentId} --conversation ${conversationId} --config ${shellArgument(options.config)}`;
	const controller = new AbortController();
	const interrupt = () => {
		process.exitCode = 130;
		controller.abort();
	};
	const outputError = (error: Error) => controller.abort(error);
	process.prependOnceListener('SIGINT', interrupt);
	process.stdout.on('error', outputError);
	const abort = () => controller.abort(new CliError(504, 'Conversation stream timed out.'));
	const total = setTimeout(abort, timeout);
	let idle = setTimeout(abort, 30000);
	try {
		const activity = () => {
			clearTimeout(idle);
			idle = setTimeout(abort, 90000);
		};
		for await (const event of context.agent.conversations.stream(conversationId, {
			signal: controller.signal,
			onActivity: activity,
		})) {
			await new Promise<void>((resolve, reject) => {
				if (controller.signal.aborted) return reject(controller.signal.reason);
				const interrupted = () => reject(controller.signal.reason);
				controller.signal.addEventListener('abort', interrupted, { once: true });
				process.stdout.write(JSON.stringify(redact(event)) + '\n', error => {
					controller.signal.removeEventListener('abort', interrupted);
					if (error) reject(error);
					else resolve();
				});
			});
			if (event.data?.type === 'error')
				throw new CliError(event.data.status || 503, event.data.errorText || 'Conversation stream interrupted.');
		}
		throw new CliError(503, 'Conversation stream disconnected.');
	} catch (error) {
		if (process.exitCode === 130) {
			console.error(`Stopped following; the remote conversation was not canceled. Inspect with: ${inspect}`);
			return;
		}
		const failure = controller.signal.reason instanceof CliError ? controller.signal.reason : error;
		if (failure instanceof CliError)
			throw new CliError(
				failure.status,
				`${failure.message} Inspect with: ${inspect}`,
				failure.source,
				failure.debug,
				failure.title,
			);
		throw new CliError(503, `Conversation stream disconnected. Inspect with: ${inspect}`);
	} finally {
		controller.abort();
		clearTimeout(total);
		clearTimeout(idle);
		process.removeListener('SIGINT', interrupt);
		process.stdout.removeListener('error', outputError);
	}
};
export const sendMessage = async (options: any) => {
	confirm(options, 'Agent execution and expected usage');
	const data = await input(options, [
		'text',
		'attachments',
		'targets',
		'modelId',
		'mode',
		'deliveryMode',
		'permissions',
		'idempotencyKey',
	]);
	if (data.idempotencyKey !== undefined && (typeof data.idempotencyKey !== 'string' || !data.idempotencyKey.trim()))
		throw new CliError(422, 'idempotencyKey must be a nonempty string.');
	data.idempotencyKey ||= randomUUID();
	try {
		const agent = (await agentContext(options)).agent;
		return sdkEnvelope(await agent.conversations.send(identifier(options.conversation, '--conversation'), data));
	} catch (error) {
		if (error instanceof CliError && error.status >= 500)
			throw new CliError(
				error.status,
				`${error.message} Retry the identical data with idempotencyKey ${JSON.stringify(data.idempotencyKey)}.`,
				error.source,
				error.debug,
				error.title,
			);
		throw error;
	}
};
export const editQueuedMessage = async (options: any) => {
	const agent = (await agentContext(options)).agent;
	return sdkEnvelope(
		await agent.conversations.editQueued(
			identifier(options.conversation, '--conversation'),
			identifier(options.message, '--message'),
			await input(options, [
				'text',
				'attachments',
				'targets',
				'modelId',
				'mode',
				'deliveryMode',
				'permissions',
				'expectedEditRevision',
			]),
		),
	);
};
export const deleteQueuedMessage = async (options: any) => {
	confirm(options, 'canceling this queued Agent message');
	const agent = (await agentContext(options)).agent;
	return sdkEnvelope(
		await agent.conversations.cancelQueued(
			identifier(options.conversation, '--conversation'),
			identifier(options.message, '--message'),
		),
	);
};
export const getExecution = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.executions.get(identifier(options.execution, '--execution')));
export const getExecutionToolEvidence = async (options: any) =>
	sdkEnvelope(
		await (
			await agentContext(options)
		).agent.executions.toolEvidence(identifier(options.execution, '--execution'), textOption(options.part, 'part')),
	);
export const invokeAgent = async (options: any) => {
	confirm(options, 'Agent execution and expected usage');
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.executions.create(await input(options, ['instruction', 'idempotencyKey'])),
	);
};
export const listSchedules = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.schedules.list(listParams(options)));
export const listScheduleOccurrences = async (options: any) =>
	sdkList(
		await (
			await agentContext(options)
		).agent.schedules.occurrences(identifier(options.schedule, '--schedule'), listParams(options)),
	);
export const createSchedule = async (options: any) => {
	const data = await input(options, [
		'idempotencyKey',
		'name',
		'instructions',
		'references',
		'attachments',
		'frequency',
		'weekday',
		'monthDay',
		'time',
		'timezone',
		'originConversationId',
	]);
	if (data.originConversationId)
		data.originConversationId = integerOption(data.originConversationId, 'originConversationId', 1);
	return sdkEnvelope(await (await agentContext(options)).agent.schedules.create(data));
};
export const updateSchedule = async (options: any) =>
	sdkEnvelope(
		await (
			await agentContext(options)
		).agent.schedules.update(
			identifier(options.schedule, '--schedule'),
			await input(options, [
				'revision',
				'name',
				'instructions',
				'references',
				'attachments',
				'frequency',
				'weekday',
				'monthDay',
				'time',
				'timezone',
				'status',
			]),
		),
	);
export const deleteSchedule = async (options: any) => {
	confirm(options, 'deleting this Agent schedule and stopping future occurrences');
	const data = await input(options, ['revision']);
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.schedules.delete(identifier(options.schedule, '--schedule'), integerOption(data.revision, 'revision', 1)),
	);
};
export const getUsage = async (options: any) => sdkEnvelope(await (await agentContext(options)).agent.usage);

export const listApplicationGrants = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.applicationGrants.get());
export const listApplicationGrantCandidates = async (options: any) =>
	sdkList(
		await (
			await agentContext(options)
		).agent.applicationGrants.candidates({ kind: options.kind, query: options.query }),
	);
export const updateApplicationGrants = async (options: any) => {
	confirm(options, 'the replacement Agent application grants');
	return sdkEnvelope(
		await (await agentContext(options)).agent.applicationGrants.update(await input(options, ['revision', 'grants'])),
	);
};
export const removeApplicationGrant = async (options: any) => {
	confirm(options, 'application access removal');
	if (!['project', 'site'].includes(options.kind)) throw new CliError(422, 'Choose project or site.');
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.applicationGrants.remove(
			options.kind,
			identifier(options.resource, '--resource'),
			(await input(options, ['revision'])).revision,
		),
	);
};
export const cancelExecution = async (options: any) =>
	sdkEnvelope(
		await (await agentContext(options)).agent.executions.cancel(identifier(options.execution, '--execution')),
	);
export const getBudget = async (options: any) => sdkEnvelope(await (await agentContext(options)).agent.budget.get());
export const updateBudget = async (options: any) =>
	sdkEnvelope(
		await (
			await agentContext(options)
		).agent.budget.update(
			await input(options, [
				'revision',
				'creditBudget',
				'budgetStopNewWork',
				'budgetAlertThresholds',
				'budgetRecipientMode',
				'budgetRecipientIds',
				'budgetEmail',
			]),
		),
	);
export const listCredentials = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.credentials.list());
export const createCredential = async (options: any) => {
	confirm(options, 'the Agent credential and its capabilities');
	return sdkEnvelope(
		await (await agentContext(options)).agent.credentials.create(await input(options, ['name', 'capabilities'])),
	);
};
export const revokeCredential = async (options: any) => {
	confirm(options, 'credential revocation');
	return sdkEnvelope(
		await (await agentContext(options)).agent.credentials.revoke(identifier(options.credential, '--credential')),
	);
};
export const listResources = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.resources.list());
export const listExternals = async (options: any) =>
	sdkList(await (await agentContext(options)).agent.externals.list());
export const listExternalOptions = async (options: any) => {
	const kind = options.kind === undefined ? undefined : textOption(options.kind, 'kind');
	if (kind && !['connector', 'mcp', 'browser'].includes(kind))
		throw new CliError(422, 'Allowed --kind values: connector, mcp, browser.');
	return sdkList(
		await (
			await agentContext(options)
		).agent.externals.options({
			...listParams(options),
			...(kind && { kind: kind as 'connector' | 'mcp' | 'browser' }),
		}),
	);
};
export const createExternal = async (options: any) => {
	confirm(options, 'the external operations and destinations');
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.externals.create(await input(options, ['kind', 'sourceId', 'operations', 'allowedOrigins'])),
	);
};
export const updateExternal = async (options: any) => {
	confirm(options, 'the revised external operations and destinations');
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.externals.update(
			identifier(options.assignment, '--assignment'),
			await input(options, ['revision', 'operations', 'allowedOrigins']),
		),
	);
};
export const revokeExternal = async (options: any) => {
	confirm(options, 'external access revocation');
	const data = await input(options, ['revision']);
	return sdkEnvelope(
		await (
			await agentContext(options)
		).agent.externals.revoke(identifier(options.assignment, '--assignment'), data.revision),
	);
};
export const listResourceOptions = async (options: any) => {
	const kind = options.kind === undefined ? undefined : textOption(options.kind, 'kind');
	if (kind !== undefined && !['skill', 'design', 'file'].includes(kind))
		throw new CliError(422, 'Allowed --kind values: skill, design, file.');
	return sdkList(
		await (
			await agentContext(options)
		).agent.resources.options({
			...listParams(options),
			...(kind && { kind: kind as 'skill' | 'design' | 'file' }),
		}),
	);
};
export const putResource = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.resources.put(await input(options, ['kind', 'resourceId'])));
export const deleteResource = async (options: any) =>
	sdkEnvelope(
		await (
			await agentContext(options)
		).agent.resources.delete(
			textOption(options.kind, 'kind') as 'skill' | 'design' | 'file',
			identifier(options.resource, '--resource'),
		),
	);
export const getFileSystem = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.fileSystem.get());
export const updateFileSystem = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.fileSystem.update(await input(options, ['revision', 'files'])));
export const listResults = async (options: any) => sdkList(await (await agentContext(options)).agent.results.list());
export const getResult = async (options: any) =>
	sdkEnvelope(await (await agentContext(options)).agent.results.get(identifier(options.result, '--result')));
