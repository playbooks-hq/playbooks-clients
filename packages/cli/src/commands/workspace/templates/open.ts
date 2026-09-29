import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { openResource } from 'src/utils/open-resource';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const openTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const response = sdkEnvelope(await context.workspaceResource.templates.get(identifier(options['template'])));
	return openResource(response.data);
};
