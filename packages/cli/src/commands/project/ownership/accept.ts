import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const acceptOwnership = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: options.project,
		request: options.request,
	});
	await confirm(options, 'Accept a Project ownership request addressed to you.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.ownership.accept(identifier(options['request'])));
	assertOperationSucceeded(response, target);
	return response;
};
