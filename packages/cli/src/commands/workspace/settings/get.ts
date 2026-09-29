import { workspaceContext } from 'src/services/command-context';

export const getWorkspacePreferences = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/preferences';
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
