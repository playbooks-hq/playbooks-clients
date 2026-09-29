import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listProjectMcps = async (options: any) => {
	const params = listParams(options, { librarySort: true });
	const context = await projectContext(options);
	return sdkList(await context.projectResource.mcps.list(params));
};
