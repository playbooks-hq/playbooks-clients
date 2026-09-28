import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listProjectMcps = async (options: any) => {
	const params = listParams(options, { librarySort: true });
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resource-mcps`;
	return client.request(path, 'GET', undefined, params, true);
};
