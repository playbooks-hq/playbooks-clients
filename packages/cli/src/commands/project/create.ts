import { workspaceContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createProject = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	const data = await input(options, ['name', 'description', 'typeId', 'folderId']);
	const response = sdkEnvelope(await context.workspaceResource.projects.create(data));
	assertOperationSucceeded(response, target);
	return response;
};
