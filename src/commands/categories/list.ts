import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';

export const listCategories = async (options: any) => {
	const client = new CliClient();
	const path = '/categories';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
