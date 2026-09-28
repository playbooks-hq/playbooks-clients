import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { secretMetadata } from 'src/utils/secret-metadata';

export const sandboxOperations = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/sandbox/config`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const response = await client.request(path, 'GET', undefined, params, true);
	return secretMetadata(response);
};
