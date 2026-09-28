import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { secretMetadata } from 'src/utils/secret-metadata';

export const listWorkspaceSecrets = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/secrets';
	const params = listParams(options);
	const response = await client.request(path, 'GET', undefined, params, true);
	return secretMetadata(response);
};
