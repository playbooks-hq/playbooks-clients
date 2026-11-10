import type { ToolDefinition } from 'src/tools/definition.js';

const scope = {
	workspace: {
		flag: 'workspace',
		description: 'Owning Workspace UUID; required for external resource scope.',
		required: true,
	},
	kind: { flag: 'kind', description: 'chats, agents, or projects.', required: true },
	resource: { flag: 'resource', description: 'Resource UUID.', required: true },
};
const confirm = { flag: 'yes', description: 'Confirm the reviewed access change.', kind: 'boolean' as const };

export const resourceAccessTools: ToolDefinition[] = [
	{
		command: 'shared resources',
		description: 'List accepted external Chat, Agent, and Project grants across Workspaces.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			type: { flag: 'type', description: 'all, chats, agents, or projects.' },
			q: { flag: 'q', description: 'Search resource and Workspace names.' },
			workspaceUuid: { flag: 'workspace-uuid', description: 'Narrow results to an owning Workspace UUID.' },
			limit: { flag: 'limit', description: 'Page size (1-100).', kind: 'number' },
			cursor: { flag: 'cursor', description: 'Continuation cursor.' },
		},
	},
	...(
		[
			['members', 'List direct resource grants.', true, undefined, undefined],
			['invitations', 'List pending resource invitations.', true, undefined, undefined],
			[
				'visibility',
				'Change Workspace or private visibility with a revision check.',
				false,
				undefined,
				['visibility', 'revision'],
			],
			['grant', 'Grant direct resource access.', false, 'member', ['role']],
			['update-grant', 'Change a direct resource grant.', false, 'member', ['role']],
			['revoke', 'Remove a direct grant; Chat and Agent members may use self to leave.', false, 'member', undefined],
			['invite', 'Invite an external person to one resource.', false, undefined, ['email', 'role']],
			['resend', 'Resend a resource invitation.', false, 'invitation', undefined],
			['revoke-invitation', 'Revoke a pending resource invitation.', false, 'invitation', undefined],
		] as const
	).map(([operation, description, readOnly, target, dataFields]) => ({
		command: `resource ${operation}`,
		description,
		toolset: 'workspace' as const,
		readOnly,
		destructive: !readOnly,
		options: {
			...scope,
			...(target === 'member'
				? {
						member: {
							flag: 'member',
							description: 'User UUID, self, or numeric Project collaborator ID.',
							required: true,
						},
					}
				: {}),
			...(target === 'invitation'
				? { invitation: { flag: 'invitation', description: 'Invitation UUID.', required: true } }
				: {}),
			...(!readOnly ? { confirm } : {}),
		},
		...(dataFields ? { dataFields: [...dataFields], dataOptional: false } : {}),
	})),
];
