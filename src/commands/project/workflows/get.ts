import { projectContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const getWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows/${identifier(options['workflow'])}`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
