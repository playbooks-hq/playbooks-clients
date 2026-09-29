import { projectContext } from 'src/services/command-context';

export const getResourceState = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resource-state`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
