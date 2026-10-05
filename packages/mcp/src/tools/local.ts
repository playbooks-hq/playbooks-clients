import type { ToolDefinition } from 'src/tools/definition.js';

export const localTools: ToolDefinition[] = [
	{
		command: 'workspace open',
		description: 'Open this resource in Playbooks.',
		toolset: 'local',
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
	},
	{
		command: 'workspace template open',
		description: 'Open this resource in Playbooks.',
		toolset: 'local',
		readOnly: false,
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
		},
	},
	{
		command: 'workspace file download',
		description: 'Download a workspace-owned agent file.',
		toolset: 'local',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			output: {
				flag: 'output',
				description: 'New destination file.',
				required: true,
			},
			fileId: {
				flag: 'file-id',
				description: 'File-id identifier.',
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
		command: 'workspace file upload',
		description: 'Upload an agent file; replacement requires its current revision.',
		toolset: 'local',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			upload: {
				flag: 'upload',
				description: 'Local file path.',
				required: true,
			},
			name: {
				flag: 'name',
				description: 'Relative agent file name.',
			},
			revision: {
				flag: 'revision',
				description: 'Existing file revision when replacing.',
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
	},
	{
		command: 'project export',
		description: 'Download project source.',
		toolset: 'local',
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
			output: {
				flag: 'output',
				description: 'New destination file.',
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
		command: 'project open',
		description: 'Open this resource in Playbooks.',
		toolset: 'local',
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
	},
	{
		command: 'project file download',
		description: 'Download a project-owned agent file.',
		toolset: 'local',
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
			output: {
				flag: 'output',
				description: 'New destination file.',
				required: true,
			},
			fileId: {
				flag: 'file-id',
				description: 'File-id identifier.',
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
		command: 'project file upload',
		description: 'Upload an agent file; replacement requires its current revision.',
		toolset: 'local',
		readOnly: false,
		destructive: true,
		options: {
			select: {
				flag: 'select',
				description: 'Comma-separated output fields, including nested fields. Pagination metadata is preserved.',
			},
			upload: {
				flag: 'upload',
				description: 'Local file path.',
				required: true,
			},
			name: {
				flag: 'name',
				description: 'Relative agent file name.',
			},
			revision: {
				flag: 'revision',
				description: 'Existing file revision when replacing.',
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
		command: 'project source import',
		description: 'Replace project source with a zip archive.',
		toolset: 'local',
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
			upload: {
				flag: 'upload',
				description: 'Local source zip.',
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
];
