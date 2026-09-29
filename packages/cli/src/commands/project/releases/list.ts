import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';
export const listReleases = async (options: any) => {
	const params = listParams(options);
	const context = await projectContext(options);
	return sdkList(await context.projectResource.releases.list(params));
};
