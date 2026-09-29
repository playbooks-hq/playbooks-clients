import type { ToolDefinition } from './definition.js';

export const coreTools: ToolDefinition[] = [
	{
		command: 'status',
		description: 'Show identity and selected context.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
		},
	},
	{
		command: 'workspace list',
		description: 'List your workspaces.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
		},
	},
	{
		command: 'projects',
		description: 'List projects in the active workspace.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			query: {
				flag: 'query',
				description: 'Search text.',
			},
			page: {
				flag: 'page',
				description: 'Zero-based page.',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page.',
				kind: 'number',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.',
			},
			include: {
				flag: 'include',
				description: 'Comma-separated relations: folder, type, projectOwner, branches, deploy.',
			},
			folder: {
				flag: 'folder',
				description: 'Folder identifier from workspace folders.',
			},
			owner: {
				flag: 'owner',
				description: 'Numeric user ID of the project owner.',
			},
		},
	},
	{
		command: 'project',
		description: 'Get a project.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			include: {
				flag: 'include',
				description: 'Comma-separated relations: folder, type, projectOwner, branches, deploy.',
			},
		},
	},
	{
		command: 'project create',
		description: 'Create a blank project.',
		toolset: 'core',
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
		},
		dataFields: ['name', 'description', 'typeId', 'folderId'],
		dataOptional: false,
	},
	{
		command: 'project update',
		description: 'Update project details.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['name', 'description', 'thumbnail', 'typeId'],
		dataOptional: false,
	},
	{
		command: 'project publication',
		description: 'Inspect publication readiness.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project lifecycle',
		description: 'Inspect lifecycle state and confirmation requirements.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project preflight',
		description: 'Review production publication requirements.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['branchId', 'expectedRevision'],
		dataOptional: true,
	},
	{
		command: 'project publish',
		description:
			'Publish project code to production. Supply the expectedRevision from preflight and confirm. Returns acceptance; inspect the release for completion.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['branchId', 'expectedRevision'],
		dataOptional: false,
	},
	{
		command: 'project settings',
		description: 'Get project preferences and instructions.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project branches',
		description: 'List project branches.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			query: {
				flag: 'query',
				description: 'Search text.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			page: {
				flag: 'page',
				description: 'Zero-based page.',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page.',
				kind: 'number',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt, position.',
			},
		},
	},
	{
		command: 'project releases',
		description: 'List project releases.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			query: {
				flag: 'query',
				description: 'Search text.',
			},
			page: {
				flag: 'page',
				description: 'Zero-based page.',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page.',
				kind: 'number',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project release',
		description: 'Inspect a release.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			release: {
				flag: 'release',
				description: 'Release identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project logs',
		description: 'Read project logs.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			project: {
				flag: 'project',
				description: 'Project identifier.',
				required: true,
			},
			query: {
				flag: 'query',
				description: 'Search text.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			limit: {
				flag: 'limit',
				description: 'Maximum log entries (1-500; server default 100).',
				kind: 'number',
			},
			cursor: {
				flag: 'cursor',
				description: 'Cursor from data.nextCursor for the next log page.',
			},
		},
	},
];
