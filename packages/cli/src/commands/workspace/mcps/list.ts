import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listWorkspaceMcps = async (options: any) => {
	const params = listParams(options, { librarySort: true });
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.mcps.list(params));
};
