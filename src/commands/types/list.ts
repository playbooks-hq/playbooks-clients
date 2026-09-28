import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';

export const listTypes = async (options: any) => {
	const client = new CliClient();
	const path = '/project-types';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
