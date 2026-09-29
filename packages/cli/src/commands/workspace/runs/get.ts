import { workspaceContext } from 'src/services/command-context';
import { integerOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const getRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.runs.get(id));
};
