import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';

export const listWorkspaces = async (options: any) => {
	const client = new CliClient();
	const path = '/workspaces';
	const params = listParams(options);
	return client.request(path, 'GET', undefined, params, true);
};
