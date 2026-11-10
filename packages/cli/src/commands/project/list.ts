import { workspaceContext } from 'src/services/command-context';
import { includeParams, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listProjects = async (options: any) => {
	const params = {
		...listParams(options, { sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['type', 'branches', 'deploy']),
	};
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.projects.list(params));
};
