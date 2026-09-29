import type { ToolDefinition } from './definition.js';

export const workspaceInboxTools: ToolDefinition[] = [
	{
		command: 'workspace inbox',
		description:
			'List Inbox conversations and requests. Defaults to needs attention; preserves counts and source metadata.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			view: { flag: 'view', description: 'attention, mentions, or all.' },
			scope: { flag: 'scope', description: 'all, workspace, project:<uuid>, or folder:<uuid>.' },
			type: {
				flag: 'type',
				description: 'all, approval, question, review, failure, mention, reply, or report.',
			},
			search: { flag: 'search', description: 'Search Inbox text.' },
			conversation: {
				flag: 'conversation',
				description: 'Filter by conversation UUID; bypasses view and source filters.',
			},
			page: { flag: 'page', description: 'Zero-based page (default 0).', kind: 'number' },
			pageSize: {
				flag: 'page-size',
				description: 'Records per page (1-100; default 20).',
				kind: 'number',
			},
			select: {
				flag: 'select',
				description: 'Comma-separated output fields. Pagination and Inbox metadata are preserved.',
			},
		},
	},
	{
		command: 'workspace inbox count',
		description: 'Get Workspace Inbox counts for all, attention, mentions, and unread.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'workspace inbox read',
		description:
			'Mark a conversation read through a loaded message. Project conversations require branchId. Does not approve or execute work.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			conversation: { flag: 'conversation', description: 'Conversation UUID.', required: true },
		},
		dataFields: ['throughMessageId', 'branchId'],
		dataOptional: false,
	},
	{
		command: 'workspace inbox read-all',
		description:
			'Mark all accessible Inbox conversations read for your account in this Workspace. Not restricted by list filters.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				description: 'Confirm marking all accessible Workspace Inbox conversations read.',
				kind: 'boolean',
			},
		},
	},
];
