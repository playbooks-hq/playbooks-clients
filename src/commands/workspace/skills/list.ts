import { workspaceContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listWorkspaceSkills = async (options: any) => {
	const params = listParams(options, { librarySort: true });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/skills';
	return client.request(path, 'GET', undefined, params, true);
};
