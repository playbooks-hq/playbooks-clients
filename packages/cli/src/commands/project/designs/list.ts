import { projectContext } from 'src/services/command-context';
import { availableParams, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listProjectDesigns = async (options: any) => {
	const params = { ...listParams(options, { librarySort: true }), ...availableParams(options) };
	const context = await projectContext(options);
	return sdkList(await context.projectResource.designs.list(params));
};
