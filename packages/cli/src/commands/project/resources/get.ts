import { projectContext } from 'src/services/command-context';

export const getProjectResources = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
