import type { ToolDefinition } from 'src/tools/definition.js';

export const templatesTools: ToolDefinition[] = [
	{
		command: 'workspace template update',
		description: 'Update an owned template listing.',
		toolset: 'templates',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			template: {
				flag: 'template',
				description: 'Template identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: [
			'name',
			'tagline',
			'description',
			'cover',
			'thumbnail',
			'licenseId',
			'categoryIds',
			'visibility',
			'packageSelection',
		],
		dataOptional: false,
	},
	{
		command: 'workspace template publish',
		description:
			'Publish a reviewed Agent or Project template package. acknowledgment must confirm sharing rights and review for private information. Later versions require notes; bump defaults to patch. Publication uses the listing visibility and does not copy conversations or credentials.',
		toolset: 'templates',
		readOnly: false,
		destructive: true,
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
			template: {
				flag: 'template',
				description: 'Template identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['acknowledgment', 'notes', 'bump', 'action'],
		dataOptional: false,
	},
	{
		command: 'workspace templates',
		description: 'List owned templates.',
		toolset: 'templates',
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
				description: 'Comma-separated relations: categories, license, stats.',
			},
			category: {
				flag: 'category',
				description: 'Category identifier from categories.',
			},
			kind: { flag: 'kind', description: 'Template kind: agent or project.' },
			type: {
				flag: 'type',
				description: 'Project type identifier from types.',
			},
		},
	},
	{
		command: 'workspace template',
		description: 'Get an owned template.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			template: {
				flag: 'template',
				description: 'Template identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
			include: {
				flag: 'include',
				description: 'Comma-separated relations: categories, license, stats.',
			},
		},
	},
	{
		command: 'workspace template versions',
		description: 'List template versions.',
		toolset: 'templates',
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
			template: {
				flag: 'template',
				description: 'Template identifier.',
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
