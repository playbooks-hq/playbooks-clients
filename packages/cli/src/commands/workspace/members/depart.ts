import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const removeMember = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, member: options.member });
	const data = await input(options, ['revision', 'toUserId']);
	await confirm(options, 'Remove a member using the reviewed revision and ownership recipient.: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.members.depart(identifier(options['member']), data));
	assertOperationSucceeded(response, target);
	return response;
};
