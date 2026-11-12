import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getMemberGovernance = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.members.governance(identifier(options.member)));
};

const mutate = async (options: any, action: 'deactivate' | 'reactivate' | 'reassign' | 'remove') => {
	const context = await workspaceContext(options);
	const member = identifier(options.member);
	const data = await input(
		options,
		action === 'reassign'
			? ['revision', 'recipientUserId']
			: action === 'remove'
				? ['revision', 'typedName']
				: ['revision'],
	);
	const target = JSON.stringify({ workspace: context.workspaceUuid, member });
	await confirm(options, `${action} Workspace member ${target}?`);
	const members = context.workspaceResource.members;
	const result =
		action === 'deactivate'
			? await members.deactivate(member, data.revision)
			: action === 'reactivate'
				? await members.reactivate(member, data.revision)
				: action === 'reassign'
					? await members.reassign(member, data)
					: await members.remove(member, data);
	const response = sdkEnvelope(result);
	assertOperationSucceeded(response, target);
	return response;
};

export const deactivateMember = (options: any) => mutate(options, 'deactivate');
export const reactivateMember = (options: any) => mutate(options, 'reactivate');
export const reassignMember = (options: any) => mutate(options, 'reassign');
export const removeMember = (options: any) => mutate(options, 'remove');
