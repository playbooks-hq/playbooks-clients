import { authenticated } from 'src/services/command-context';

export const listWorkspace = async (options: any) => {
	const { client } = await authenticated(options);
	return client.workspaces.list();
};
