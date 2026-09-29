import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const listTemplateVersions = async (options: any) => {
	const params = listParams(options, { pageSizeMax: 100 });
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}/versions`;
	return client.request(path, 'GET', undefined, params, true);
};
