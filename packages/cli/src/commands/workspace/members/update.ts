import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateMember = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, member: options.member });
	const data = await input(options, ['memberRole']);
	await confirm(options, 'Update a Workspace member role.: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.members.update(identifier(options['member']), data));
	assertOperationSucceeded(response, target);
	return response;
};
