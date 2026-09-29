import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createBranch = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	const data = await input(options, ['name', 'baseBranch', 'branchId']);
	const response = sdkEnvelope(await context.projectResource.branches.create(data));
	assertOperationSucceeded(response, target);
	return response;
};
