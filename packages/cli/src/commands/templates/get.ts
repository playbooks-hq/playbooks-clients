import { CliClient } from 'src/services/cli-client';
import { identifier, includeParams } from 'src/utils/cli-input';

export const getTemplate = async (options: any) => {
	const params = includeParams(options, ['categories', 'license', 'stats']);
	const client = new CliClient();
	const path = `/templates/${identifier(options['template'])}`;
	return client.request(path, 'GET', undefined, params, true);
};
