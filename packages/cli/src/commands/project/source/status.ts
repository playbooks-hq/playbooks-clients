import { projectContext } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getSourceStatus = async (options: any) => {
	const context = await projectContext(options);
	return sdkEnvelope(await context.projectResource.source.status());
};
