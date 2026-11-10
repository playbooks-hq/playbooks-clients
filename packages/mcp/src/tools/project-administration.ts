import type { ToolDefinition } from 'src/tools/definition.js';
import { z } from 'zod';

const sandboxService = z.strictObject({
	uuid: z.uuid().optional(),
	key: z.string().min(1),
	status: z.enum(['active', 'disabled']).optional(),
	commands: z.array(z.string().min(1)),
	port: z.number().int().min(1).max(65535).nullable().optional(),
	dependsOn: z.array(z.string()).optional(),
	position: z.number().int().nonnegative().optional(),
});

const sandboxConfiguration = z
	.strictObject({
		expectedVersionId: z.number().int().positive().nullable().optional(),
		services: z.array(sandboxService).optional(),
		primaryServiceId: z.number().int().positive().optional(),
		runtimeUuid: z.uuid().optional(),
		lifecycleUuid: z.uuid().optional(),
	})
	.describe(
		'Version-checked Sandbox configuration. Service environment values and secrets use the private credential flow.',
	);

export const projectAdministrationTools: ToolDefinition[] = [
	{
		command: 'project archive',
		description: 'Archive the project.',
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
		dataFields: ['confirmation'],
		dataOptional: false,
	},
	{
		command: 'project restore',
		description: 'Restore the project.',
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
		dataFields: ['confirmation'],
		dataOptional: false,
	},
	{
		command: 'project delete',
		description: 'Permanently delete the project.',
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
		dataFields: ['confirmation'],
		dataOptional: false,
	},
	{
		command: 'project collaborator add',
		description: 'Grant project access to an existing workspace member.',
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
		dataFields: ['userId', 'role'],
		dataOptional: false,
	},
	{
		command: 'project collaborator update',
		description: 'Update project collaborator access.',
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
			collaborator: {
				flag: 'collaborator',
				description: 'Collaborator identifier.',
				required: true,
			},
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace identifier. Never changes saved CLI context.',
				required: true,
			},
		},
		dataFields: ['role'],
		dataOptional: false,
	},
	{
		command: 'project collaborators',
		description: 'List project collaborators.',
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
			sort: {
				flag: 'sort',
				description: 'Sort field:asc|desc; fields: id, createdAt, updatedAt.',
			},
		},
	},
	{
		command: 'project sandbox',
		description: 'Inspect project sandbox configuration and resize status.',
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
		command: 'project sandbox configure',
		description: 'Configure Sandbox services and primary service using the current expectedVersionId.',
		toolset: 'project',
		readOnly: false,
		destructive: false,
		options: {
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
		dataSchema: sandboxConfiguration,
	},
];
