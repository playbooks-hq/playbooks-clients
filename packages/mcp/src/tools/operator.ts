import type { ToolDefinition } from './definition.js';

export const operatorTools: ToolDefinition[] = [
	{
		command: 'project conversation',
		description:
			'Get a conversation; the default may initialize the primary conversation. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
		},
	},
	{
		command: 'project conversations',
		description:
			'List project conversations; may initialize the primary conversation. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
		},
	},
	{
		command: 'project messages',
		description: 'List recent operator messages. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			branch: {
				flag: 'branch',
				description: 'Numeric branch identifier; defaults to the conversation current branch.',
				kind: 'number',
			},
			cursor: {
				flag: 'cursor',
				description: 'Continuation cursor from meta.nextCursor.',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Input messages per window, 1-100; output messages are included.',
				kind: 'number',
			},
		},
	},
	{
		command: 'project message',
		description: 'Get a sandbox conversation message. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			branch: {
				flag: 'branch',
				description: 'Numeric branch identifier; defaults to the conversation current branch.',
				kind: 'number',
			},
			message: {
				flag: 'message',
				description: 'Numeric message identifier.',
				kind: 'number',
				required: true,
			},
		},
	},
	{
		command: 'project message create',
		description:
			'Submit a message; may start or steer execution and incur usage. Access may initialize the primary conversation. Acceptance is not completion; inspect returned messages and explicitly selected runs.',
		toolset: 'operator',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			branch: {
				flag: 'branch',
				description: 'Numeric branch identifier; defaults to the conversation current branch.',
				kind: 'number',
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
		},
		dataFields: [
			'text',
			'mode',
			'modelId',
			'deliveryMode',
			'replyToMessageId',
			'maxCredits',
			'idempotencyKey',
			'attachments',
		],
		dataOptional: false,
	},
	{
		command: 'project message update',
		description: 'Edit a queued sandbox message. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			branch: {
				flag: 'branch',
				description: 'Numeric branch identifier; defaults to the conversation current branch.',
				kind: 'number',
			},
			message: {
				flag: 'message',
				description: 'Numeric message identifier.',
				kind: 'number',
				required: true,
			},
		},
		dataFields: ['text', 'queuedMode', 'queuedModelId'],
		dataOptional: false,
	},
	{
		command: 'project message delete',
		description: 'Cancel a queued message; retains message history. Access may initialize the primary conversation.',
		toolset: 'operator',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			branch: {
				flag: 'branch',
				description: 'Numeric branch identifier; defaults to the conversation current branch.',
				kind: 'number',
			},
			message: {
				flag: 'message',
				description: 'Numeric message identifier.',
				kind: 'number',
				required: true,
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
		},
	},
	{
		command: 'project runs',
		description: 'List operator runs and attempts.',
		toolset: 'operator',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			conversation: {
				flag: 'conversation',
				description: 'Filter by conversation UUID.',
			},
			branch: {
				flag: 'branch',
				description: 'Filter by numeric branch identifier.',
				kind: 'number',
			},
			message: {
				flag: 'message',
				description: 'Filter by numeric input message identifier.',
				kind: 'number',
			},
			page: {
				flag: 'page',
				description: 'Zero-based page.',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page, 1-100.',
				kind: 'number',
			},
		},
	},
	{
		command: 'project run',
		description: 'Get an operator run with its available input and output.',
		toolset: 'operator',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			run: {
				flag: 'run',
				description: 'Numeric run identifier.',
				kind: 'number',
				required: true,
			},
		},
	},
];
