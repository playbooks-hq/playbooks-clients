import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const getTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
