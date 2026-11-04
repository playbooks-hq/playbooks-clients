import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceChatsTools: ToolDefinition[] = [
	...['chat', 'project'].map(
		(owner): ToolDefinition => ({
			command: `${owner === 'chat' ? 'workspace chat' : 'project'} channels`,
			description:
				'Inspect channel assignments and readiness. Channel access is distinct from outbound connector tools; account setup and personal verification use secure controls.',
			toolset: 'workspace',
			readOnly: true,
			destructive: false,
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				[owner]: { flag: owner, description: `${owner} UUID.`, required: true },
			},
		}),
	),
	...['get', 'download', 'replace', 'preview', 'save'].map(
		(operation): ToolDefinition => ({
			command: `workspace chat working-files ${operation}`,
			description:
				'Chat working tree, separate from background References. Replace requires the exact revision. Save requires a stable requestId and creates an independent Workspace snapshot. Preview HTML requires a credential-free isolated renderer.',
			toolset: 'workspace',
			readOnly: ['get', 'download'].includes(operation),
			destructive: operation === 'replace',
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				chat: { flag: 'chat', description: 'Chat UUID.', required: true },
				...(operation === 'download'
					? {
							output: {
								flag: 'output',
								description: 'New local ZIP path; never overwrites existing files.',
								required: true,
							},
						}
					: {}),
			},
			...(['get', 'download'].includes(operation)
				? {}
				: { dataFields: ['revision', 'files', 'path', 'entryPoint', 'name', 'requestId'], dataOptional: false }),
		}),
	),
	...['get', 'create', 'revise', 'save'].map(
		(operation): ToolDefinition => ({
			command: `workspace plan ${operation}`,
			description:
				'Conversation-owned Plan revisions. Reads and edits never grant execution authority; changes invalidate older pending approval. Save snapshots the selected revision independently to the Workspace.',
			toolset: 'workspace',
			readOnly: operation === 'get',
			destructive: false,
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				conversation: { flag: 'conversation', description: 'Conversation UUID.', required: true },
				project: { flag: 'project', description: 'Owning Project UUID where applicable.' },
				plan: { flag: 'plan', description: 'Plan UUID; omit for current on reads.' },
				revision: { flag: 'revision', description: 'Exact revision to read.' },
			},
			...(operation === 'get'
				? {}
				: { dataFields: ['title', 'content', 'revision', 'requestId'], dataOptional: false }),
		}),
	),

	{
		command: 'workspace chats',
		description: 'List durable Workspace Chats. Project-owned operational Agents remain under their Projects.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			page: { flag: 'page', description: 'Zero-based page.', kind: 'number' },
			pageSize: { flag: 'page-size', description: 'Records per page (1-100).', kind: 'number' },
			query: { flag: 'query', description: 'Search Chat names.' },
			archived: { flag: 'archived', description: 'List archived Chats.', kind: 'boolean' },
		},
	},
	{
		command: 'workspace chat',
		description:
			'Read Chat identity, configuration, revision and capabilities. Opens Main unless another owned conversation is specified.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
			conversation: { flag: 'conversation', description: 'Optional conversation UUID belonging to this Chat.' },
			configuration: {
				flag: 'configuration',
				description: 'Include eligible configuration resources.',
				kind: 'boolean',
			},
		},
	},
	{
		command: 'workspace chat create',
		description:
			'Create a Workspace Chat and fresh Main conversation without provisioning an application environment or running inference. Reuse the same idempotencyKey after an uncertain response.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true } },
		dataFields: ['name', 'idempotencyKey', 'composerOverrides', 'designSelection', 'blankStart'],
		dataOptional: false,
	},
	{
		command: 'workspace chat update',
		description:
			'Update a Chat using its current revision. Actions are configure, main, archive, restore and delete. Main requires an owned conversation numeric ID. Delete requires the exact Chat name in confirmation. Archive/delete block schedules and reject active work. Configuration never grants underlying resource access. resourceSelection.connectorIds explicitly selects eligible Workspace connection IDs; omitted or empty grants none. Changing connectorIds requires Workspace connector management authority and connectors.manage for API keys.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
			confirm: { flag: 'yes', description: 'Confirm archival or deletion.', kind: 'boolean' },
		},
		dataFields: [
			'revision',
			'action',
			'name',
			'composerOverrides',
			'resourceSelection',
			'designSelection',
			'conversationId',
			'confirmation',
		],
		dataOptional: false,
	},
	{
		command: 'workspace chat conversations',
		description: 'List active conversations belonging to a Chat, including which conversation is Main.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
		},
	},
	{
		command: 'workspace chat conversation create',
		description:
			'Create an alternate Chat conversation without running inference. Reuse the same idempotencyKey after uncertain responses. Main and existing schedule destinations remain unchanged.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
		},
		dataFields: ['title', 'idempotencyKey'],
		dataOptional: false,
	},
];
