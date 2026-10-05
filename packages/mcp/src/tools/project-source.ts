import type { ToolDefinition } from 'src/tools/definition.js';

export const projectSourceTools: ToolDefinition[] = [
	{
		command: 'project source connect',
		description: 'Connect a repository; source may be replaced unless preserveSource is supported and selected.',
		toolset: 'project',
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
		dataFields: [
			'provider',
			'githubInstallationId',
			'githubRepositoryId',
			'workspaceConnectorId',
			'workspace',
			'repository',
			'repositoryId',
			'namespaceId',
			'repositoryName',
			'subdirectory',
			'preserveSource',
		],
		dataOptional: false,
	},
	{
		command: 'project source disconnect',
		description: 'Disconnect the project repository.',
		toolset: 'project',
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
	},
	{
		command: 'project source sync',
		description: 'Synchronize source using the reviewed Git head.',
		toolset: 'project',
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
		dataFields: ['branchId', 'expectedHead'],
		dataOptional: false,
	},
	{
		command: 'project branch create',
		description: 'Create a branch from a selected base branch.',
		toolset: 'project',
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
		dataFields: ['name', 'baseBranch', 'branchId'],
		dataOptional: false,
	},
	{
		command: 'project checkpoint rename',
		description: 'Rename a project checkpoint.',
		toolset: 'project',
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
			checkpoint: {
				flag: 'checkpoint',
				description: 'Checkpoint identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['label'],
		dataOptional: false,
	},
	{
		command: 'project checkpoint restore',
		description: 'Restore a source checkpoint; application data is unchanged.',
		toolset: 'project',
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
			checkpoint: {
				flag: 'checkpoint',
				description: 'Checkpoint identifier.',
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
		command: 'project source',
		description: 'Inspect project source control.',
		toolset: 'project',
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
		command: 'project checkpoints',
		description: 'List project checkpoints.',
		toolset: 'project',
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
		},
	},
];
