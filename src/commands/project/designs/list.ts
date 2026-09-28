import { projectContext } from 'src/services/command-context';
import { availableParams, listParams } from 'src/utils/cli-input';

export const listProjectDesigns = async (options: any) => {
	const params = { ...listParams(options, { librarySort: true }), ...availableParams(options) };
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources/library/designs`;
	return client.request(path, 'GET', undefined, params, true);
};
