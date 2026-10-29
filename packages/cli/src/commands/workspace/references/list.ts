import { workspaceContext } from 'src/services/command-context';
import { availableParams, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listWorkspaceReferences = async (options: any) => {
	const params = { ...listParams(options, { pageSizeMax: 100 }), ...availableParams(options) };
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.references.list(params));
};
