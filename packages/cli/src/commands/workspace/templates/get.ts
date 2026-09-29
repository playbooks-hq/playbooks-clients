import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams } from 'src/utils/cli-input';

export const getTemplate = async (options: any) => {
	const params = includeParams(options, ['categories', 'license', 'stats']);
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}`;
	return client.request(path, 'GET', undefined, params, true);
};
