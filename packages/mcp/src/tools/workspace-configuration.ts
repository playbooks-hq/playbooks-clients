import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceConfigurationTools: ToolDefinition[] = [
	{
		command: 'workspace update',
		description: 'Update the active workspace profile.',
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
		},
		dataFields: ['thumbnail', 'name', 'tagline', 'description', 'visibility', 'urls'],
		dataOptional: false,
	},
	{
		command: 'workspace settings',
		description: 'Get workspace operator preferences and instructions.',
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
		},
	},
	{
		command: 'workspace settings update',
		description: 'Update workspace operator preferences.',
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
		},
		dataFields: ['mode', 'deliveryMode', 'instructions', 'modelId', 'permissions'],
		dataOptional: false,
	},
	{
		command: 'workspace resource-retention',
		description: 'Get deleted-resource retention policy and entitlement.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			select: { flag: 'select', description: 'Comma-separated output fields.' },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace resource-retention update',
		description: 'Enable or disable 30-day deleted-resource retention.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			select: { flag: 'select', description: 'Comma-separated output fields.' },
			confirm: { flag: 'yes', description: 'Confirm this policy change.', kind: 'boolean' },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
		dataFields: ['retainDeletedResources30Days'],
		dataOptional: false,
	},
	{
		command: 'workspace retained-resource restore',
		description: 'Restore a whole retained resource before its deletion deadline.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			select: { flag: 'select', description: 'Comma-separated output fields.' },
			confirm: { flag: 'yes', description: 'Confirm this restore.', kind: 'boolean' },
			type: { flag: 'type', description: 'chat, agent, project, site, or artifact.', required: true },
			resource: { flag: 'resource', description: 'Resource UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace designs',
		description: 'List available workspace designs.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			page: {
				flag: 'page',
				description: 'Zero-based page (default 0).',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page (1-100; default 20).',
				kind: 'number',
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
		},
	},
	{
		command: 'workspace skills',
		description: 'List available workspace skills.',
		toolset: 'workspace',
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
				description: 'Sort: name:asc or updatedAt:desc.',
			},
		},
	},
	{
		command: 'workspace mcps',
		description: 'List workspace MCP connections.',
		toolset: 'workspace',
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
				description: 'Sort: name:asc or updatedAt:desc.',
			},
		},
	},
	{
		command: 'workspace connectors',
		description: 'List workspace connector connections.',
		toolset: 'workspace',
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
				description: 'Sort field:asc|desc; fields: id, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'workspace secrets',
		description: 'List safe workspace secret metadata.',
		toolset: 'workspace',
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
				description: 'Zero-based page (default 0).',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page (1-100; default 20).',
				kind: 'number',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'workspace files',
		description: 'List Workspace Files.',
		toolset: 'workspace',
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
				description: 'Zero-based page (default 0).',
				kind: 'number',
			},
			pageSize: {
				flag: 'page-size',
				description: 'Records per page (1-100; default 20).',
				kind: 'number',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			available: {
				flag: 'available',
				description: 'Include available and inherited resources.',
				kind: 'boolean',
			},
		},
	},
];
