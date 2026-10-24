import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceAgentsTools: ToolDefinition[] = [
	{
		command: 'workspace agents',
		description: 'List durable Workspace Agents. Project-owned operational Agents remain under their Projects.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			page: { flag: 'page', description: 'Zero-based page.', kind: 'number' },
			pageSize: { flag: 'page-size', description: 'Records per page (1-100).', kind: 'number' },
			query: { flag: 'query', description: 'Search Agent names.' },
			archived: { flag: 'archived', description: 'List archived Agents.', kind: 'boolean' },
		},
	},
	{
		command: 'workspace agent',
		description:
			'Read Agent identity, configuration, revision and capabilities. Opens Main unless another owned conversation is specified.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			agent: { flag: 'agent', description: 'Workspace Agent UUID.', required: true },
			conversation: { flag: 'conversation', description: 'Optional conversation UUID belonging to this Agent.' },
			configuration: {
				flag: 'configuration',
				description: 'Include eligible configuration resources.',
				kind: 'boolean',
			},
		},
	},
	{
		command: 'workspace agent create',
		description:
			'Create a Workspace Agent and fresh Main conversation without provisioning an application environment or running inference. Reuse the same idempotencyKey after an uncertain response.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true } },
		dataFields: ['name', 'idempotencyKey', 'composerOverrides', 'designSelection', 'blankStart'],
		dataOptional: false,
	},
	{
		command: 'workspace agent update',
		description:
			'Update an Agent using its current revision. Actions are configure, main, archive, restore and delete. Main requires an owned conversation numeric ID. Delete requires the exact Agent name in confirmation. Archive/delete block schedules and reject active work. Configuration never grants underlying resource access.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			agent: { flag: 'agent', description: 'Workspace Agent UUID.', required: true },
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
		command: 'workspace agent conversations',
		description: 'List active conversations belonging to an Agent, including which conversation is Main.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			agent: { flag: 'agent', description: 'Workspace Agent UUID.', required: true },
		},
	},
	{
		command: 'workspace agent conversation create',
		description:
			'Create an alternate Agent conversation without running inference. Reuse the same idempotencyKey after uncertain responses. Main and existing schedule destinations remain unchanged.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			agent: { flag: 'agent', description: 'Workspace Agent UUID.', required: true },
		},
		dataFields: ['title', 'idempotencyKey'],
		dataOptional: false,
	},
	{
		command: 'workspace saved-assets',
		description:
			'List the acting user’s explicitly saved Agent artifact revisions. Current source access still applies. Follow hasMore even when a page contains fewer than 25 results.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			page: { flag: 'page', description: 'Zero-based page.', kind: 'number' },
		},
	},
	...(['save', 'unsave'] as const).map(action => ({
		command: `workspace asset ${action}`,
		description:
			action === 'save'
				? 'Save an authorized ready artifact revision to your Library. Does not copy, share or execute it.'
				: 'Remove your Library reference. Does not delete the source artifact.',
		toolset: 'workspace' as const,
		readOnly: false,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			conversation: { flag: 'conversation', description: 'Originating conversation UUID.', required: true },
			asset: { flag: 'asset', description: 'Artifact revision UUID.', required: true },
		},
	})),
];
