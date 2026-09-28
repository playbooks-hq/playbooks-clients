import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const listTemplateVersions = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}/versions`;
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
