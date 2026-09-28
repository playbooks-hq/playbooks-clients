import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const getResourceState = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resource-state`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
