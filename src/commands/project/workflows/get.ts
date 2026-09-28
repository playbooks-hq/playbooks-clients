import { projectContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const getWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows/${identifier(options['workflow'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
