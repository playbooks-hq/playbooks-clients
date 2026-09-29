import { workspaceContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createFolder = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid });
	const data = await input(options, ['name', 'description']);
	const response = sdkEnvelope(await context.workspaceResource.folders.create(data));
	assertOperationSucceeded(response, target);
	return response;
};
