import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getProject = async (options: any) => {
	const params = includeParams(options, ['folder', 'type', 'projectOwner', 'branches', 'deploy']);
	const id = identifier(options.project, '--project');
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.projects.get(id, params));
};
