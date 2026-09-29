import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createInvitation = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid });
	const data = await input(options, ['email', 'role']);
	await confirm(options, 'Invite a Workspace member.: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.invitations.create(data));
	assertOperationSucceeded(response, target);
	return response;
};
