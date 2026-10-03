import type { ToolDefinition } from './definition.js';

const scope = {
	workspace: { flag: 'workspace', description: 'Authorized Workspace UUID.', required: true },
	project: { flag: 'project', description: 'Parent Project UUID.', required: true },
};
const test = { flag: 'test', description: 'Test UUID under the parent.', required: true };
const confirm = {
	flag: 'yes',
	description: 'Confirm the reviewed effects and possible usage.',
	kind: 'boolean' as const,
};
export const projectTestTools: ToolDefinition[] = [
	{
		command: 'project tests',
		description: 'List Tests and operation history.',
		toolset: 'project',
		readOnly: true,
		destructive: false,
		options: {
			...scope,
			search: { flag: 'search', description: 'Search operation titles.' },
			before: { flag: 'before', description: 'Operation pagination cursor.', kind: 'number' },
		},
	},
	{
		command: 'project test',
		description: 'Inspect Test admission, capabilities and operations.',
		toolset: 'project',
		readOnly: true,
		destructive: false,
		options: { ...scope, test },
	},
	{
		command: 'project test operation',
		description: 'Inspect a Test operation, findings and evidence.',
		toolset: 'project',
		readOnly: true,
		destructive: false,
		options: { ...scope, test, operation: { flag: 'operation', description: 'Operation UUID.', required: true } },
	},
	{
		command: 'project test create',
		description: 'Create a Test and prepare its isolated environment; may incur usage.',
		toolset: 'project',
		readOnly: false,
		destructive: false,
		options: { ...scope, confirm },
		dataFields: ['requestKey', 'name', 'instructions', 'branchId', 'intent', 'authMethod'],
	},
	{
		command: 'project test action',
		description:
			'Apply a Test lifecycle action. Preserve requestKey on retry. Stop requires operationId; resets/deletion require current revision and confirm in data.',
		toolset: 'project',
		readOnly: false,
		destructive: true,
		options: {
			...scope,
			test,
			confirm,
			action: {
				flag: 'action',
				description:
					'test, data, reset, delete, stop, sleep, refresh, reset-workspace, preview-start, preview-stop, preview-restart.',
				required: true,
			},
		},
		dataFields: [
			'requestKey',
			'revision',
			'confirm',
			'operationId',
			'instructions',
			'attachments',
			'replacesOperationId',
			'intent',
			'authMethod',
		],
	},
];
