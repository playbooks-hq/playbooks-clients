import { workspaceContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateWorkspacePreferences = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid });
	const data = await input(options, ['mode', 'deliveryMode', 'instructions', 'modelId', 'permissions']);
	const response = sdkEnvelope(await context.workspaceResource.settings.update(data));
	assertOperationSucceeded(response, target);
	return response;
};
