import { CliClient } from 'src/services/cli-client';
import { identifier } from 'src/utils/cli-input';

export const getTemplate = async (options: any) => {
	const client = new CliClient();
	const path = `/templates/${identifier(options['template'])}`;
	const params = {};
	return client.request(path, 'GET', undefined, params, true);
};
