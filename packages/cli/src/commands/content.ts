import { agentContext } from 'src/commands/agent';
import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceReferenceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, integerOption, textOption } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

type ContentOwner = 'chat' | 'project' | 'agent';

export const contentOwners = [
	{ owner: 'chat', command: 'workspace chat' },
	{ owner: 'project', command: 'project' },
	{ owner: 'agent', command: 'agent' },
] as const;

const chatContent = async (options: any) => {
	const { workspaceReference, workspaceUuid } = await workspaceReferenceContext(options);
	const id = identifier(options.chat, '--chat');
	const chat = await workspaceReference.chats.get(id);
	if (chat.uuid !== id || chat.workspace?.uuid !== workspaceUuid)
		throw new CliError(403, 'The Chat does not belong to the requested Workspace.');
	return { sources: workspaceReference.chats.sources(id), artifacts: workspaceReference.chats.artifacts(id) };
};

const page = (options: any) =>
	options.page === undefined ? {} : { page: integerOption(options.page, 'page', 0, 100000) };
const contentList = (options: any) => ({
	...page(options),
	...(options.query === undefined ? {} : { search: textOption(options.query, 'query') }),
});
const optionalText = (value: unknown, flag: string) => (value === undefined ? undefined : textOption(value, flag));
const bytes = (content: Uint8Array) => sdkEnvelope({ contentBase64: Buffer.from(content).toString('base64') });

export const sourceOperation = (owner: ContentOwner, operation: string) => async (options: any) => {
	const agentSources = owner === 'agent' ? (await agentContext(options)).agent.sources : undefined;
	const projectSources = owner === 'project' ? (await projectContext(options)).projectResource.sources : undefined;
	const chatSources = owner === 'chat' ? (await chatContent(options)).sources : undefined;
	const sources = agentSources ?? projectSources ?? chatSources!;
	if (operation === 'list') {
		const type = options.type;
		if (type !== undefined && !['images', 'documents', 'data', 'email'].includes(type))
			throw new CliError(422, '--type must be images, documents, data, or email.');
		return sdkList(await sources.list({ ...contentList(options), ...(type === undefined ? {} : { type }) }));
	}
	const id = identifier(options.source, '--source');
	const selection = {
		version: textOption(options.version, 'version'),
		conversationId: identifier(options.conversation, '--conversation'),
	};
	switch (operation) {
		case 'get':
			return sdkEnvelope(await sources.get(id, selection));
		case 'preview':
		case 'download':
			return bytes(await sources[operation](id, selection));
		case 'copy-target':
			return sdkEnvelope(await sources.copyTarget(id, selection));
		case 'copy-to-file-system': {
			const data = await input(options, [
				'revision',
				'path',
				'activityConversationId',
				...(owner === 'project' ? ['expectedBranchId'] : []),
			]);
			const copy = {
				...selection,
				revision: textOption(data.revision, 'revision'),
				path: textOption(data.path, 'path'),
				activityConversationId: optionalText(data.activityConversationId, 'activityConversationId'),
			};
			if (projectSources) {
				const expectedBranchId = integerOption(data.expectedBranchId, 'expectedBranchId', 1);
				return sdkEnvelope(await projectSources.copyToFileSystem(id, { ...copy, expectedBranchId }));
			}
			const selected = agentSources ?? chatSources!;
			return sdkEnvelope(await selected.copyToFileSystem(id, copy));
		}
	}
	if (!agentSources) throw new CliError(422, 'This Source operation requires an Agent.');
	switch (operation) {
		case 'rename':
			return sdkEnvelope(
				await agentSources.rename(id, {
					...selection,
					...(await input(options, ['expectedName', 'name', 'activityConversationId'])),
				}),
			);
		case 'duplicate':
			return sdkEnvelope(
				await agentSources.duplicate(id, {
					...selection,
					...(await input(options, ['expectedName', 'name', 'requestId', 'activityConversationId'])),
				}),
			);
		case 'delete':
			await confirm(options, `Delete Source ${id} from this Agent?`);
			return sdkEnvelope(
				await agentSources.delete(id, {
					...selection,
					...(await input(options, ['expectedName', 'activityConversationId'])),
				}),
			);
		default:
			throw new CliError(422, 'Unknown Source operation.');
	}
};

export const artifactOperation = (owner: ContentOwner, operation: string) => async (options: any) => {
	const agentArtifacts = owner === 'agent' ? (await agentContext(options)).agent.artifacts : undefined;
	const customerArtifacts =
		owner === 'chat'
			? (await chatContent(options)).artifacts
			: owner === 'project'
				? (await projectContext(options)).projectResource.artifacts
				: undefined;
	const artifacts = agentArtifacts ?? customerArtifacts!;
	if (operation === 'list') return sdkList(await artifacts.list(contentList(options)));
	if (operation === 'prepare' && agentArtifacts)
		return sdkEnvelope(
			await agentArtifacts.prepare(
				await input(options, [
					'conversationId',
					'requestId',
					'artifactId',
					'expectedVersionId',
					'name',
					'type',
					'source',
				]),
			),
		);
	if (customerArtifacts && (operation === 'register' || operation === 'prepare')) {
		const fields = ['requestId', 'name', 'type', 'origin', 'editingSource'];
		const data = await input(
			options,
			operation === 'register' ? [...fields, 'sourceReceipt'] : [...fields, 'artifactId', 'paths', 'routingMode'],
		);
		return sdkEnvelope(await customerArtifacts[operation](data));
	}
	const id = identifier(options.artifact, '--artifact');
	const version = optionalText(options.version, 'version');
	switch (operation) {
		case 'get':
			return sdkEnvelope(await artifacts.get(id, version));
		case 'versions':
			return sdkList(await artifacts.versions(id, page(options)));
		case 'export':
			return bytes(await artifacts.export(id, version));
		case 'update':
			return sdkEnvelope(
				await artifacts.update(
					id,
					await input(options, [
						'name',
						'description',
						'activityConversationId',
						...(agentArtifacts ? ['archived'] : []),
					]),
				),
			);
		case 'open':
		case 'preview':
			if (customerArtifacts) return sdkEnvelope(await customerArtifacts[operation](id, version));
			break;
		case 'download':
			if (customerArtifacts) return bytes(await customerArtifacts.download(id, version));
			break;
		case 'delete':
			if (agentArtifacts) {
				await confirm(options, `Delete Artifact ${id} from this Agent?`);
				const data = await input(options, ['confirmation']);
				return sdkEnvelope(await agentArtifacts.delete(id, textOption(data.confirmation, 'confirmation')));
			}
			break;
	}
	throw new CliError(422, 'Unknown Artifact operation for this owner.');
};
