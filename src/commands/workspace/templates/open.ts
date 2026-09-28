import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { openResource } from 'src/utils/open-resource';

export const openTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const response = await context.client.request(`/workspace/templates/${identifier(options['template'])}`);
	return openResource(response.data);
};
