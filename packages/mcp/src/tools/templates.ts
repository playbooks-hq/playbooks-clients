import type { ToolDefinition } from 'src/tools/definition.js';

export const templatesTools: ToolDefinition[] = [
	{
		command: 'workspace chat template create',
		description: 'Create or return the private draft Template for an authorized Chat. This does not publish a version.',
		toolset: 'templates',
		readOnly: false,
		destructive: false,
		options: {
			chat: { flag: 'chat', description: 'Source Chat UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace chat template draft',
		description: 'Read the owned draft Template for an authorized Chat, if one exists.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			chat: { flag: 'chat', description: 'Source Chat UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace project template create',
		description: 'Create or return the private draft Template for an authorized Project.',
		toolset: 'templates',
		readOnly: false,
		destructive: false,
		options: {
			project: { flag: 'project', description: 'Source Project UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace project template draft',
		description: 'Read the owned draft Template for an authorized Project, if one exists.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			project: { flag: 'project', description: 'Source Project UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace agent template create',
		description: 'Create or return the private draft Template for an authorized Agent.',
		toolset: 'templates',
		readOnly: false,
		destructive: false,
		options: {
			agent: { flag: 'agent', description: 'Source Agent UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace agent template draft',
		description: 'Read the owned draft Template for an authorized Agent, if one exists.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			agent: { flag: 'agent', description: 'Source Agent UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace template materials',
		description:
			'Inspect selectable working files, Artifact versions, Files, Designs, Skills, Connectors, and MCPs for an owned Template. Use exact identifiers and revisions in packageSelection.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			template: { flag: 'template', description: 'Owned Template UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace chat template setup',
		description: 'Inspect safe importable resources and connection setup for an authorized adopted Chat.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			chat: { flag: 'chat', description: 'Adopted Chat UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace chat template item',
		description:
			'Inspect the exact immutable content of one importable File, Design, or Skill in an adopted Chat Template before Workspace-wide import. Use the package key from setup inventory.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			chat: { flag: 'chat', description: 'Adopted Chat UUID.', required: true },
			category: { flag: 'category', description: 'files, designs, or skills.', required: true },
			key: { flag: 'key', description: 'Exact package key from setup inventory.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace chat template import',
		description:
			'Explicitly import selected Files, Designs, or Skills into an adopted Chat. Supply keys from setup, acknowledgment true, a stable idempotencyKey, and human confirmation. Connector and MCP setup remains separate.',
		toolset: 'templates',
		readOnly: false,
		destructive: true,
		options: {
			chat: { flag: 'chat', description: 'Adopted Chat UUID.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
			confirm: { flag: 'yes', description: 'Confirm the explicit import.', kind: 'boolean' },
		},
		dataFields: ['category', 'keys', 'acknowledgment', 'idempotencyKey'],
		dataOptional: false,
	},
	{
		command: 'workspace template source',
		description:
			'Review the current authorized source and safe package inventory. Use returned sourceRevision and expectedRevision for a separate, human-confirmed publish action.',
		toolset: 'templates',
		readOnly: true,
		destructive: false,
		options: {
			template: { flag: 'template', description: 'Owned Template identifier.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace identifier.', required: true },
		},
	},
	{
		command: 'workspace template remix',
		description:
			'Create an independent Chat, Project, or Agent from one exact published Template version in the selected Workspace. Supply versionId and a stable idempotencyKey; recipient connections require separate setup.',
		toolset: 'templates',
		readOnly: false,
		destructive: true,
		options: {
			template: { flag: 'template', description: 'Template identifier.', required: true },
			workspace: { flag: 'workspace', description: 'Explicit destination Workspace identifier.', required: true },
			confirm: { flag: 'yes', description: 'Confirm creation of the independent resource.', kind: 'boolean' },
		},
		dataFields: ['versionId', 'idempotencyKey', 'name'],
		dataOptional: false,
	},
	{
		command: 'workspace template update',
		description:
			'Update an owned listing and complete packageSelection. All three kinds select editable Files, Designs, Skills, Connectors, and MCPs by exact identifiers and revisions. Chat may also select working files and saved Artifact versions; Project may select a saved source; optional preview selects an eligible public Site. Connections require recipient setup.',
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
			'Publish a reviewed Chat, Project, or eligible Agent template package. Supply expectedRevision and exact sourceRevision from source review. acknowledgment confirms sharing rights and review for private information. Publication uses the listing visibility; bump defaults to patch. Existing adopters keep their selected version. A human must explicitly confirm this operation.',
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
		dataFields: ['acknowledgment', 'expectedRevision', 'sourceRevision', 'notes', 'bump'],
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
			kind: { flag: 'kind', description: 'Template kind: project, agent, or chat.' },
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
