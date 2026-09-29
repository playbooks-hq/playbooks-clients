import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const preflightProject = async (options: any) => {
	const context = await projectContext(options);
	const data = options.data === undefined ? {} : await input(options, ['branchId', 'expectedRevision']);
	return sdkEnvelope(await context.projectResource.preflight(data));
};
