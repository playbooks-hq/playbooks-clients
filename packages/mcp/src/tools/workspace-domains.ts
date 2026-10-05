import type { ToolDefinition } from 'src/tools/definition.js';

export const workspaceDomainsTools: ToolDefinition[] = [
	{
		command: 'workspace domains',
		description: 'List workspace domains.',
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
		},
	},
	{
		command: 'workspace domain',
		description: 'Inspect a domain.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			domain: {
				flag: 'domain',
				description: 'Domain identifier.',
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
		command: 'workspace domain add',
		description: 'Add an existing external domain; does not purchase a domain.',
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
		},
		dataFields: ['name'],
		dataOptional: false,
	},
	{
		command: 'workspace domain records',
		description: 'Inspect DNS records.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			page: { flag: 'page', description: 'Zero-based page (default 0).', kind: 'number' },
			pageSize: { flag: 'page-size', description: 'Records per page (1-100; default 20).', kind: 'number' },
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			domain: {
				flag: 'domain',
				description: 'Domain identifier.',
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
		command: 'workspace domain record create',
		description: 'Create a DNS record.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
			domain: {
				flag: 'domain',
				description: 'Domain identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['type', 'name', 'value', 'ttl', 'priority', 'port', 'weight'],
		dataOptional: false,
	},
	{
		command: 'workspace domain record update',
		description: 'Update a DNS record.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			record: {
				flag: 'record',
				description: 'DNS record identifier.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
			domain: {
				flag: 'domain',
				description: 'Domain identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['type', 'name', 'value', 'ttl', 'priority', 'port', 'weight'],
		dataOptional: false,
	},
	{
		command: 'workspace domain record delete',
		description: 'Delete a DNS record.',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			record: {
				flag: 'record',
				description: 'DNS record identifier.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				description:
					'Confirm the reviewed operation and its possible side effects or usage charges. Defaults to false.',
				kind: 'boolean',
			},
			domain: {
				flag: 'domain',
				description: 'Domain identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
];
