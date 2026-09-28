import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listProjectDesigns = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources/library/designs`;
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
