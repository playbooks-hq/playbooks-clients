import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const transferOwnership = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: context.projectResource.uuid });
	const data = await input(options, ['toUserId']);
	await confirm(options, 'Request Project ownership transfer to an active member.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.ownership.transfer(data));
	assertOperationSucceeded(response, target);
	return response;
};
