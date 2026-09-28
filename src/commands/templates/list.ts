import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';

export const listTemplates = async (options: any) => {
	const client = new CliClient();
	const path = '/templates';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
