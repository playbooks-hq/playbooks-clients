import { workspaceContext } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const usageOperations = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.usage.get());
};
