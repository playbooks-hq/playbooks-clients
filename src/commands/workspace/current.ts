import { workspaceContext } from 'src/services/command-context';

export const currentWorkspace = async (options: any) => {
	return (await workspaceContext({ ...options, workspace: undefined })).workspace;
};
