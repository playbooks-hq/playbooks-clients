import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const activityOperations = async (options: any) => {
	const params = listParams(options, { sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.activity.list(params));
};
