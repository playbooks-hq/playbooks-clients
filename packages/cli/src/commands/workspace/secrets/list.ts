import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';
import { secretMetadata } from 'src/utils/secret-metadata';

export const listWorkspaceSecrets = async (options: any) => {
	const params = listParams(options, { pageSizeMax: 100, sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await workspaceContext(options);
	const response = sdkList(await context.workspaceResource.secrets.list(params));
	return secretMetadata(response);
};
