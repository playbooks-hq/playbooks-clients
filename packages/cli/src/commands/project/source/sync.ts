import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const syncSource = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	const data = await input(options, ['branchId', 'expectedHead']);
	await confirm(options, 'Synchronize source using the reviewed Git head.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.source.sync(data));
	assertOperationSucceeded(response, target);
	return response;
};
