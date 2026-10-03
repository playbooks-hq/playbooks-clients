import { projectContext } from 'src/services/command-context';
import { includeParams } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getProject = async (options: any) => {
	const params = includeParams(options, ['folder', 'type', 'projectOwner', 'branches', 'deploy']);
	const context = await projectContext(options, params);
	return sdkEnvelope(context.projectResource);
};
