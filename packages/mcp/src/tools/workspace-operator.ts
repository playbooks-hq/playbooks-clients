import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceOperatorTools: ToolDefinition[] = [
	{
		command: 'workspace conversation',
		description:
			'Get a conversation; the default may initialize the primary conversation. Access may initialize the primary conversation.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
		},
	},
	{
		command: 'workspace messages',
		description: 'List recent operator messages. Access may initialize the primary conversation.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
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
		command: 'workspace message',
		description:
			'Get an operator message and available run references. Access may initialize the primary conversation.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
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
		command: 'workspace message update',
		description:
			'Edit a pending queued message before execution begins. Access may initialize the primary conversation.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
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
		command: 'workspace message create',
		description:
			'Submit a message; may start or steer execution and incur usage. Access may initialize the primary conversation. Acceptance is not completion; inspect returned messages and explicitly selected runs.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
		},
		dataFields: ['text', 'mode', 'modelId', 'deliveryMode', 'replyToMessageId', 'idempotencyKey'],
		dataOptional: false,
	},
	{
		command: 'workspace message delete',
		description: 'Cancel a queued message; retains message history. Access may initialize the primary conversation.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
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
		command: 'workspace runs',
		description: 'List operator runs and attempts.',
		toolset: 'workspace',
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
			conversation: {
				flag: 'conversation',
				description: 'Conversation UUID; defaults to the primary conversation.',
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
		command: 'workspace run',
		description: 'Get an operator run with its available input and output.',
		toolset: 'workspace',
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
			run: {
				flag: 'run',
				description: 'Numeric run identifier.',
				kind: 'number',
				required: true,
			},
		},
	},
];
