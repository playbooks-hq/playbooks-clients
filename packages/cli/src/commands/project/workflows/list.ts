import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listWorkflows = async (options: any) => {
	const params = listParams(options, { pageSizeMax: 100 });
	const context = await projectContext(options);
	return sdkList(await context.projectResource.workflows.list(params));
};
