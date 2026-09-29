import type { ToolDefinition } from './definition.js';

export const discoveryTools: ToolDefinition[] = [
	{
		command: 'templates',
		description: 'Explore public templates.',
		toolset: 'discovery',
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
			type: {
				flag: 'type',
				description: 'Project type identifier from types.',
			},
		},
	},
	{
		command: 'template',
		description: 'Get a public template.',
		toolset: 'discovery',
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
			include: {
				flag: 'include',
				description: 'Comma-separated relations: categories, license, stats.',
			},
		},
	},
	{
		command: 'categories',
		description: 'Explore categories.',
		toolset: 'discovery',
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
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'collections',
		description: 'Explore collections.',
		toolset: 'discovery',
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
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'creators',
		description: 'Explore public creators.',
		toolset: 'discovery',
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
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'types',
		description: 'List curated project types.',
		toolset: 'discovery',
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
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt, position.',
			},
		},
	},
];
