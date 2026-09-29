import { projectContext } from 'src/services/command-context';

export const getOwnershipRequest = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/ownership-request`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
