import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listMembers = async (options: any) => {
	const params = listParams(options, {});
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.members.list(params));
};
