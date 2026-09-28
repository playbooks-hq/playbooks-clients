import { workspaceContext } from 'src/services/command-context';
import { openResource } from 'src/utils/open-resource';

export const openWorkspace = async (options: any) => {
	const context = await workspaceContext(options);
	const response = context.workspace;
	return openResource(response.data);
};
