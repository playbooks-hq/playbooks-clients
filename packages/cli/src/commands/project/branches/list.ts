import { projectContext } from 'src/services/command-context';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listBranches = async (options: any) => {
	const params = listParams(options, {
		pageBase: 1,

		sort: ['id', 'name', 'createdAt', 'updatedAt', 'position'],
	});
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/branches`;
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
