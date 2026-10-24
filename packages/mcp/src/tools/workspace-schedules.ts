import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceSchedulesTools: ToolDefinition[] = [
	{
		command: 'workspace agent-schedules',
		description: 'List authorized Agent scheduled messages. Optionally filter by the Agent owning a conversation.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			conversation: { flag: 'conversation', description: 'Originating conversation UUID.' },
		},
	},
	{
		command: 'workspace agent-schedule',
		description:
			'Read saved instruction, revision, model selection, destination, timing and occurrence history. Queued is not completed.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			schedule: { flag: 'schedule', description: 'Schedule UUID.', required: true },
		},
	},
	{
		command: 'workspace agent-schedule preview',
		description:
			'Preview the next three times using daily, weekly or monthly recurrence and an IANA timezone. Does not schedule work.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: { workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true } },
		dataFields: ['frequency', 'weekday', 'monthDay', 'time', 'timezone'],
		dataOptional: false,
	},
	{
		command: 'workspace agent-schedule create',
		description:
			'Save one self-contained scheduled instruction with authorized durable references. Resolve ambiguous history-dependent instructions before saving. Persist the operator’s model and originating conversation; standalone authoring defaults to Agent Main. Use new-conversation to create one conversation per occurrence. Creation does not run work.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm future execution and usage when enabled is true.',
			},
		},
		dataFields: [
			'agentId',
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
		],
		dataOptional: false,
	},
	{
		command: 'workspace agent-schedule update',
		description:
			'Update, pause, resume, delete or run a saved message with expectedRevision. Update requires complete changes. Run requires a stable idempotencyKey; replay the same key after uncertain results. Execution uses current authority, queues, funding and approvals. Inspect occurrence history for completion. Edits affect future admissions only.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			schedule: { flag: 'schedule', description: 'Schedule UUID.', required: true },
			confirm: { flag: 'yes', kind: 'boolean', description: 'Confirm run, resume, delete or enabling future usage.' },
		},
		dataFields: ['action', 'expectedRevision', 'changes', 'idempotencyKey'],
		dataOptional: false,
	},
];
