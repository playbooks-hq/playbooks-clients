import type { ToolDefinition } from 'src/tools/definition.js';
import { z } from 'zod';

export const workspaceChatsTools: ToolDefinition[] = [
	...['project'].map(
		(owner): ToolDefinition => ({
			command: `${owner} channels`,
			description:
				'Inspect channel assignments and readiness. Channel access is distinct from outbound connector tools; account setup and personal verification use secure controls.',
			toolset: 'workspace',
			readOnly: true,
			destructive: false,
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				[owner]: { flag: owner, description: `${owner} UUID.`, required: true },
			},
		}),
	),
	...['get', 'download', 'replace', 'preview', 'save'].map(
		(operation): ToolDefinition => ({
			command: `workspace chat file-system ${operation}`,
			description:
				'Chat File system, separate from managed Files. Replace requires the exact revision. Save requires a stable requestId and creates an independent Workspace snapshot. Preview HTML requires a credential-free isolated renderer.',
			toolset: 'workspace',
			readOnly: ['get', 'download'].includes(operation),
			destructive: operation === 'replace',
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				chat: { flag: 'chat', description: 'Chat UUID.', required: true },
				...(operation === 'download'
					? {
							output: {
								flag: 'output',
								description: 'New local ZIP path; never overwrites existing files.',
								required: true,
							},
						}
					: {}),
			},
			...(['get', 'download'].includes(operation)
				? {}
				: { dataFields: ['revision', 'files', 'path', 'entryPoint', 'name', 'requestId'], dataOptional: false }),
		}),
	),
	...['get', 'create', 'revise'].map(
		(operation): ToolDefinition => ({
			command: `workspace plan ${operation}`,
			description: 'Read or edit a conversation-owned Plan revision. Changes invalidate older pending approval.',
			toolset: 'workspace',
			readOnly: operation === 'get',
			destructive: false,
			options: {
				workspace: { flag: 'workspace', description: 'Workspace UUID.', required: true },
				conversation: { flag: 'conversation', description: 'Conversation UUID.', required: true },
				project: { flag: 'project', description: 'Owning Project UUID where applicable.' },
				chat: { flag: 'chat', description: 'Owning Chat UUID. Required when the key omits Workspace ownership.' },
				...(operation === 'create'
					? {}
					: {
							plan: {
								flag: 'plan',
								description: 'Plan UUID. Omit on get for the current Plan.',
								required: operation === 'revise',
							},
						}),
				...(operation === 'get' ? { revision: { flag: 'revision', description: 'Exact revision to read.' } } : {}),
			},
			...(operation === 'get'
				? {}
				: {
						dataSchema: z.strictObject({
							content: z.string().min(1),
							...(operation === 'create' ? { title: z.string().min(1) } : { revision: z.string().min(1) }),
						}),
					}),
		}),
	),

	{
		command: 'workspace chats',
		description: 'List Workspace Chats, each with one conversation.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			page: { flag: 'page', description: 'Zero-based page.', kind: 'number' },
			pageSize: { flag: 'page-size', description: 'Records per page (1-100).', kind: 'number' },
			query: { flag: 'query', description: 'Search Chat names.' },
			archived: { flag: 'archived', description: 'List archived Chats.', kind: 'boolean' },
		},
	},
	{
		command: 'workspace chat',
		description: 'Read Chat identity, revision, capabilities and its sole conversation.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
		},
	},
	{
		command: 'workspace chat create',
		description:
			'Create a Workspace Chat and its sole conversation without provisioning an application environment or running inference. Reuse the same idempotencyKey after an uncertain response.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true } },
		dataFields: ['name', 'idempotencyKey'],
		dataOptional: false,
	},
	{
		command: 'workspace chat update',
		description:
			'Rename, archive, restore or delete a Chat using its current revision. Delete requires its exact name in confirmation and deletes its schedules. Archive pauses schedules; restore leaves them paused. Active work must finish or be canceled',
		toolset: 'workspace',
		readOnly: false,
		destructive: true,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true },
			chat: { flag: 'chat', description: 'Workspace Chat UUID.', required: true },
			confirm: { flag: 'yes', description: 'Confirm archival or deletion.', kind: 'boolean' },
		},
		dataFields: ['revision', 'action', 'name', 'confirmation'],
		dataOptional: false,
	},
];
