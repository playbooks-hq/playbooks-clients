import { projectContext } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';

export const listReleases = async (options: any) => {
	const params = listParams(options);
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/releases`;
	if (params.query !== undefined) {
		params.search = params.query;
		delete params.query;
	}
	if (params.page !== undefined) params.page += 1;
	const response = await client.request(path, 'GET', undefined, params, true);
	if (response.meta?.page !== undefined) response.meta.page -= 1;
	return response;
};
