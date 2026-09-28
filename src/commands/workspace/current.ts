import { authenticated, workspaceContext } from 'src/services/command-context';

export const currentWorkspace = async (options: any) => {
	await authenticated(options);
	return (await workspaceContext(options)).workspace;
};
