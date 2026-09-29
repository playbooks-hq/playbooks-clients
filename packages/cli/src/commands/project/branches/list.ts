import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listBranches = async (options: any) => {
	const params = listParams(options, {
		sort: ['id', 'name', 'createdAt', 'updatedAt', 'position'],
	});
	const context = await projectContext(options);
	return sdkList(await context.projectResource.branches.list(params));
};
