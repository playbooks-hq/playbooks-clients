import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const reviewTemplateSource = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.templates.source(identifier(options.template)));
};
