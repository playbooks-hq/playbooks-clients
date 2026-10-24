import type { ToolDefinition } from 'src/tools/definition.js';

export const projectSchedulesTools: ToolDefinition[] = [
	{
		command: 'project schedules',
		description: 'List saved project schedules.',
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
		command: 'project schedule',
		description: 'Inspect a saved scheduled message. Use runs or occurrences to read execution history.',
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
			schedule: {
				flag: 'schedule',
				description: 'Schedule identifier.',
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
		command: 'project schedule create',
		description: 'Create a self-contained scheduled message.',
		toolset: 'project',
		readOnly: false,
		destructive: false,
		options: {
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm enabling future execution and usage. Required when enabled is true.',
			},
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
		dataFields: [
			'name',
			'instructions',
			'references',
			'modelId',
			'branchId',
			'destination',
			'destinationConversationId',
			'enabled',
			'recurrence',
			'time',
			'timezone',
		],
		dataOptional: false,
	},
	{
		command: 'project schedule update',
		description: 'Update the saved message, model, branch, destination, and timing atomically.',
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
			schedule: {
				flag: 'schedule',
				description: 'Schedule identifier.',
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
			'instructions',
			'references',
			'modelId',
			'branchId',
			'destination',
			'destinationConversationId',
			'enabled',
			'recurrence',
			'time',
			'timezone',
			'revision',
		],
		dataOptional: false,
	},
	{
		command: 'project schedule delete',
		description: 'Delete a saved scheduled message; retain execution history.',
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
			schedule: {
				flag: 'schedule',
				description: 'Schedule identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['revision'],
		dataOptional: false,
	},
	{
		command: 'project schedule run',
		description: 'Run saved work now; may send notifications, change external systems, and incur usage charges.',
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
			schedule: {
				flag: 'schedule',
				description: 'Schedule identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['revision', 'requestKey'],
		dataOptional: false,
	},
	...(['runs', 'occurrences', 'run-detail'] as const).map(kind => ({
		command: `project schedule ${kind}`,
		description: `Read scheduled-message ${kind}.`,
		toolset: 'project' as const,
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', required: true, description: 'Explicit authorized Workspace UUID.' },
			project: { flag: 'project', required: true, description: 'Project UUID.' },
			schedule: { flag: 'schedule', required: true, description: 'Schedule UUID.' },
			...(kind === 'run-detail'
				? { run: { flag: 'run', required: true, description: 'Run UUID.' } }
				: {
						page: { flag: 'page', kind: 'number' as const, description: 'Zero-based page.' },
						pageSize: { flag: 'page-size', kind: 'number' as const, description: 'Records per page (1-100).' },
					}),
		},
	})),
];
