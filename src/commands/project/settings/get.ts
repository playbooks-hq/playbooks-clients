import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const getProjectPreferences = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/preferences`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
