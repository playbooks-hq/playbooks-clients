import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const getMember = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/members/${identifier(options['member'])}`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
