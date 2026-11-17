import type { ToolDefinition, ToolOption } from 'src/tools/definition.js';
import { z } from 'zod';

const text = z.string().min(1);
const numericId = z.number().int().positive();
const customerArtifactType = z
	.enum(['document', 'presentation', 'diagram', 'website', 'interactive-experience', 'other'])
	.optional();
const paths = z.array(text).min(1);
const routingMode = z.enum(['files', 'spa']).optional();
const confirmation: ToolOption = { flag: 'yes', kind: 'boolean', description: 'Confirm the reviewed action.' };
const workspace: ToolOption = { flag: 'workspace', description: 'Owning Workspace UUID.', required: true };
const page: ToolOption = { flag: 'page', kind: 'number', description: 'Zero-based page.' };
const query: ToolOption = { flag: 'query', description: 'Search names.' };
const ownerOption = (owner: string): ToolOption => ({
	flag: owner,
	description: 'Owning resource UUID.',
	required: true,
});

const agentArtifactPrepare = z.strictObject({
	conversationId: text,
	requestId: text,
	artifactId: text.optional(),
	expectedVersionId: text.nullable().optional(),
	name: text,
	type: text.optional(),
	source: z.discriminatedUnion('kind', [
		z.strictObject({ kind: z.literal('agent-tree'), revisionId: text, entrypoint: text, paths, routingMode }),
		z.strictObject({ kind: z.literal('agent-output'), outputId: text, checksum: text }),
	]),
});

const owners = [
	{ owner: 'chat', prefix: 'workspace chat', toolset: 'workspace' },
	{ owner: 'project', prefix: 'project', toolset: 'project' },
	{ owner: 'agent', prefix: 'agent', toolset: 'core' },
] as const;

export const contentTools: ToolDefinition[] = owners.flatMap(({ owner, prefix, toolset }) => {
	const scope = { workspace, [owner]: ownerOption(owner) };
	const source: Record<string, ToolOption> = {
		...scope,
		source: { flag: 'source', description: 'Source ID from the authorized collection.', required: true },
		version: { flag: 'version', description: 'Exact Source version ID.', required: true },
		conversation: { flag: 'conversation', description: 'Source conversation UUID.', required: true },
	};
	const sourceOperations = [
		{ operation: 'get', description: 'Inspect one exact Source version.' },
		{ operation: 'preview', description: 'Return exact Source preview bytes as Base64.' },
		{ operation: 'download', description: 'Return exact Source bytes as Base64.' },
		{ operation: 'copy-target', description: 'Inspect the current File system destination and revision.' },
		{
			operation: 'copy-to-file-system',
			description: 'Copy the exact Source version to a new path using the reviewed File system target.',
			dataSchema: z.strictObject({
				revision: text,
				path: text,
				activityConversationId: text.optional(),
				...(owner === 'project' ? { expectedBranchId: numericId } : {}),
			}),
		},
		...(owner === 'agent'
			? [
					{
						operation: 'rename',
						description: 'Rename the Agent Source using its expected current name.',
						dataSchema: z.strictObject({ expectedName: text, name: text, activityConversationId: text.optional() }),
					},
					{
						operation: 'duplicate',
						description: 'Duplicate the Agent Source using a stable request ID.',
						dataSchema: z.strictObject({
							expectedName: text,
							name: text,
							requestId: text,
							activityConversationId: text.optional(),
						}),
					},
					{
						operation: 'delete',
						description: 'Delete the Agent Source using its expected current name.',
						dataSchema: z.strictObject({ expectedName: text, activityConversationId: text.optional() }),
					},
				]
			: []),
	];

	const artifact: Record<string, ToolOption> = {
		...scope,
		artifact: { flag: 'artifact', description: 'Artifact ID.', required: true },
	};
	const version: ToolOption = { flag: 'version', description: 'Exact Artifact version ID. Defaults to current.' };
	const origin = z.strictObject({
		[owner === 'chat' ? 'chatId' : 'projectId']: numericId,
		conversationId: numericId,
	});
	const customerSource = { id: text, revisionId: text, entrypoint: text };
	const editingSource = z.strictObject({
		...customerSource,
		type: z.literal(owner === 'chat' ? 'chat-tree' : 'project-branch'),
	});
	const sourceReceipt = z.strictObject({
		sourceType: z.enum(['workspace', 'project']),
		sourceId: text,
		sourceRevisionId: text,
	});
	const registrationFields = { name: text, requestId: text, type: customerArtifactType, origin };
	const registration = z.union([
		z.strictObject({ ...registrationFields, editingSource, sourceReceipt: sourceReceipt.optional() }),
		z.strictObject({
			...registrationFields,
			editingSource: z
				.union([editingSource, z.strictObject({ ...customerSource, type: z.literal('submitted-content') })])
				.nullable()
				.optional(),
			sourceReceipt,
		}),
	]);
	const customerPrepare = z.strictObject({
		...registrationFields,
		artifactId: text.optional(),
		editingSource,
		paths,
		routingMode,
	});
	const artifactOperations = [
		{ operation: 'get', description: 'Inspect a retained Artifact version.', options: { ...artifact, version } },
		{ operation: 'versions', description: 'List retained versions of this Artifact.', options: { ...artifact, page } },
		{ operation: 'export', description: 'Return saved Artifact bytes as Base64.', options: { ...artifact, version } },
		{
			operation: 'prepare',
			description: 'Prepare an Artifact from explicitly selected saved content and a stable request ID.',
			options: scope,
			dataSchema: owner === 'agent' ? agentArtifactPrepare : customerPrepare,
		},
		{
			operation: 'update',
			description: 'Update supported Artifact metadata.',
			options: artifact,
			dataSchema: z.strictObject({
				name: text.optional(),
				description: z.string().optional(),
				activityConversationId: text.optional(),
				...(owner === 'agent' ? { archived: z.boolean().optional() } : {}),
			}),
		},
		...(owner === 'agent'
			? [
					{
						operation: 'delete',
						description: 'Delete an Agent Artifact using the exact Artifact name.',
						options: { ...artifact, confirm: confirmation },
						dataSchema: z.strictObject({ confirmation: text }),
					},
				]
			: [
					{
						operation: 'open',
						description: 'Request a viewing link for the selected Artifact version.',
						options: { ...artifact, version },
					},
					{
						operation: 'preview',
						description: 'Return preview HTML for the selected Artifact version as data.',
						options: { ...artifact, version },
					},
					{
						operation: 'download',
						description: 'Return saved Artifact bytes as Base64.',
						options: { ...artifact, version },
					},
					{
						operation: 'register',
						description: 'Register an Artifact from a reviewed origin and exact editing source or Source receipt.',
						options: scope,
						dataSchema: registration,
					},
				]),
	];

	return [
		{
			command: `${prefix} sources`,
			description: 'List supplied Sources owned by this resource.',
			toolset,
			readOnly: true,
			destructive: false,
			options: {
				...scope,
				page,
				query,
				type: { flag: 'type', description: 'Source type: images, documents, data, or email.' },
			},
		},
		...sourceOperations.map(
			({ operation, description, dataSchema }): ToolDefinition => ({
				command: operation === 'get' && owner !== 'project' ? `${prefix} source` : `${prefix} source ${operation}`,
				description,
				toolset,
				readOnly: !dataSchema,
				destructive: operation === 'delete',
				options: operation === 'delete' ? { ...source, confirm: confirmation } : source,
				dataSchema,
			}),
		),
		{
			command: `${prefix} artifacts`,
			description: 'List Artifacts retained for this resource.',
			toolset,
			readOnly: true,
			destructive: false,
			options: { ...scope, page, query },
		},
		...artifactOperations.map(
			({ operation, description, options, dataSchema }): ToolDefinition => ({
				command: operation === 'get' ? `${prefix} artifact` : `${prefix} artifact ${operation}`,
				description,
				toolset,
				readOnly: !dataSchema,
				destructive: operation === 'delete',
				options,
				dataSchema,
			}),
		),
	];
});

const readCursor: Record<string, ToolOption> = {
	throughMessageId: {
		flag: 'through-message-id',
		kind: 'number',
		description: 'Last reviewed message ID. Use zero for empty history.',
		required: true,
	},
	observedAt: {
		flag: 'observed-at',
		description: 'readObservedAt from the loaded conversation history.',
		required: true,
	},
};
const agentConversation = {
	workspace,
	agent: ownerOption('agent'),
	conversation: { flag: 'conversation', description: 'Conversation UUID.', required: true },
};

export const contentConversationTools: ToolDefinition[] = [
	{
		command: 'workspace chat conversation read',
		description: 'Mark the selected Chat conversation read through a message from the reviewed history.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace, chat: ownerOption('chat'), conversation: agentConversation.conversation, ...readCursor },
	},
	...(['read', 'unread'] as const).map(
		(operation): ToolDefinition => ({
			command: `agent conversation ${operation}`,
			description: `Mark the selected Agent conversation ${operation}.`,
			toolset: 'core',
			readOnly: false,
			destructive: false,
			options: { ...agentConversation, ...(operation === 'read' ? readCursor : {}) },
		}),
	),
	{
		command: 'agent plan get',
		description: 'Read the current Agent conversation Plan or select an exact Plan and revision.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			...agentConversation,
			plan: { flag: 'plan', description: 'Plan UUID. Omit to read the current Plan.' },
			revision: { flag: 'revision', description: 'Exact revision ID for the selected Plan.' },
		},
	},
	{
		command: 'agent plan source',
		description: 'Read exact Plan source from an Agent conversation message part.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			...agentConversation,
			message: { flag: 'message', kind: 'number', description: 'Source message ID.', required: true },
			part: { flag: 'part', description: 'Exact message part ID.', required: true },
		},
	},
	{
		command: 'agent plan create',
		description: 'Create an Agent conversation Plan.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: agentConversation,
		dataSchema: z.strictObject({ title: text, content: text }),
	},
	{
		command: 'agent plan revise',
		description: 'Revise the selected Agent conversation Plan using its expected revision.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: { ...agentConversation, plan: { flag: 'plan', description: 'Plan UUID.', required: true } },
		dataSchema: z.strictObject({ revision: text, content: text }),
	},
];
