import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listAgents = async (options: any) => {
	const params = listParams(options, {});
	const context = await projectContext(options);
	return sdkList(await context.projectResource.agents.list(params));
};
