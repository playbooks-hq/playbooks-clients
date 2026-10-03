import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const addCollaborator = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: context.projectResource.uuid });
	const data = await input(options, ['userId', 'role']);
	await confirm(options, 'Grant Project access to an existing Workspace member.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.collaborators.add(data));
	assertOperationSucceeded(response, target);
	return response;
};
