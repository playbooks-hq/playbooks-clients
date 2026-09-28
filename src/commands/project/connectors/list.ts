import { projectContext } from 'src/services/command-context';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listProjectConnectors = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/connectors`;
	const operational = context.project.data.executionProfile === 'operational';
	const params = listParams(options, {
		sort: ['id', 'createdAt', 'updatedAt'],
		pageBase: operational ? undefined : 1,
		pageSizeMax: operational ? 100 : undefined,
	});
	const response = await client.request(path, 'GET', undefined, params, true);
	return operational ? response : zeroBasedPage(response);
};
