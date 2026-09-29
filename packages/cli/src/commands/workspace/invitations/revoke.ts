import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const revokeInvitation = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, invitation: options.invitation });
	await confirm(options, 'Revoke a pending invitation.: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.invitations.revoke(identifier(options['invitation'])));
	assertOperationSucceeded(response, target);
	return response;
};
