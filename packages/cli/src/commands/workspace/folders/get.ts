import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getFolder = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.folders.get(identifier(options['folder'])));
};
