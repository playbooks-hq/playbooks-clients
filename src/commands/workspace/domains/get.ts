import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const getDomain = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/domains/${identifier(options['domain'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
