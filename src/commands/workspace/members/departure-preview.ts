import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const previewMemberDeparture = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/session/workspaces/${identifier(context.state.workspace)}/members/${identifier(options['member'])}/departure`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
