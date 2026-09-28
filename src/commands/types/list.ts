import { CliClient } from 'src/services/cli-client';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listTypes = async (options: any) => {
	const params = listParams(options, {
		pageBase: 1,

		sort: ['id', 'name', 'createdAt', 'updatedAt', 'position'],
	});
	const client = new CliClient();
	const path = '/project-types';
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
