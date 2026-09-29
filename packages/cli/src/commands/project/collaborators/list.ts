import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listCollaborators = async (options: any) => {
	const params = listParams(options, { sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await projectContext(options);
	return sdkList(await context.projectResource.collaborators.list(params));
};
