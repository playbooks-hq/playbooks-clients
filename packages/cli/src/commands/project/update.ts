import { workspaceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateProject = async (options: any) => {
	const id = identifier(options.project, '--project');
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	const data = await input(options, ['name', 'description', 'thumbnail', 'typeId']);
	const response = sdkEnvelope(await context.workspaceResource.projects.update(id, data));
	assertOperationSucceeded(response, target);
	return response;
};
