import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';

export const listCollections = async (options: any) => {
	const client = new CliClient();
	const path = '/collections';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
