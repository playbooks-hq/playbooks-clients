import { CliError } from 'src/services/cli-client';
import { authenticated, workspaceReferenceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, integerOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

type Operation =
	| 'visibility'
	| 'members'
	| 'grant'
	| 'update-grant'
	| 'revoke'
	| 'invitations'
	| 'invite'
	| 'resend'
	| 'revoke-invitation';

export const sharedResources = async (options: any) => {
	const { client } = await authenticated(options);
	if (options.type && !['all', 'chats', 'agents', 'projects'].includes(options.type))
		throw new CliError(422, 'Select all, chats, agents, or projects.');
	return sdkEnvelope(
		await client.session.sharedResources({
			type: options.type,
			q: options.q,
			workspaceUuid: options['workspace-uuid'],
			cursor: options.cursor,
			...(options.limit === undefined ? {} : { limit: integerOption(options.limit, 'limit', 1, 100) }),
		}),
	);
};

export const resourceAccess = (operation: Operation) => async (options: any) => {
	if (!['chats', 'agents', 'projects'].includes(options.kind))
		throw new CliError(422, 'Select chats, agents, or projects.');
	const context = await workspaceReferenceContext(options);
	const resource = identifier(options.resource, '--resource');
	const sharing = context.client.resourceSharing(context.workspaceUuid, options.kind, resource);
	if (operation === 'members') return sdkEnvelope(await sharing.members());
	if (operation === 'invitations') return sdkEnvelope(await sharing.invitations.list());
	const fields =
		operation === 'visibility' ? ['visibility', 'revision'] : operation === 'invite' ? ['email', 'role'] : ['role'];
	const data = ['visibility', 'invite', 'grant', 'update-grant'].includes(operation)
		? await input(options, fields)
		: null;
	const member = ['grant', 'update-grant', 'revoke'].includes(operation)
		? identifier(options.member, '--member')
		: null;
	if (operation === 'grant' && options.kind === 'projects') integerOption(member, 'member', 1);
	const invitation = ['resend', 'revoke-invitation'].includes(operation)
		? identifier(options.invitation, '--invitation')
		: null;
	if (operation === 'visibility') {
		if (!['workspace', 'private'].includes(data.visibility) || !Number.isSafeInteger(data.revision))
			throw new CliError(422, 'Provide visibility workspace or private and an integer revision.');
	}
	if (['invite', 'grant', 'update-grant'].includes(operation) && !['viewer', 'editor', 'admin'].includes(data.role))
		throw new CliError(422, 'Choose viewer, editor, or admin.');
	if (operation === 'invite' && (typeof data.email !== 'string' || !data.email.trim()))
		throw new CliError(422, 'Provide an email address.');
	await confirm(options, `Confirm ${operation} for ${options.kind}/${resource} in ${context.workspaceUuid}?`);
	if (operation === 'visibility') {
		return sdkEnvelope(await sharing.setVisibility(data));
	}
	if (operation === 'invite') return sdkEnvelope(await sharing.invitations.create(data));
	if (operation === 'resend') return sdkEnvelope(await sharing.invitations.resend(invitation));
	if (operation === 'revoke-invitation') return sdkEnvelope(await sharing.invitations.revoke(invitation));
	if (operation === 'revoke') return sdkEnvelope(await sharing.revoke(member));
	return sdkEnvelope(
		await (operation === 'grant' ? sharing.grant(member, data.role) : sharing.updateGrant(member, data.role)),
	);
};
