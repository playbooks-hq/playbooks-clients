import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const moveProject = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: context.projectResource.uuid });
	const data = await input(options, ['folderId']);
	const response = sdkEnvelope(await context.projectResource.move(data));
	assertOperationSucceeded(response, target);
	return response;
};
