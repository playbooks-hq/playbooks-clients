import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const previewMemberDeparture = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/session/workspaces/${identifier(context.workspaceUuid)}/members/${identifier(options['member'])}/departure`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
