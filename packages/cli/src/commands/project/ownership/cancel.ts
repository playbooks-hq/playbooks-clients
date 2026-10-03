import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const cancelOwnership = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		request: options.request,
	});
	await confirm(options, 'Cancel a pending Project ownership request.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.ownership.cancel(identifier(options['request'])));
	assertOperationSucceeded(response, target);
	return response;
};
