import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getTemplate = async (options: any) => {
	const params = includeParams(options, ['categories', 'license', 'stats']);
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.templates.get(identifier(options['template']), params));
};
