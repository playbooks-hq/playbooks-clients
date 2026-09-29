import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';
export const listProjectConnectors = async (options: any) => {
	const context = await projectContext(options);
	const params = listParams(options, {
		sort: ['id', 'createdAt', 'updatedAt'],
	});
	return sdkList(await context.projectResource.connectors.list(params));
};
