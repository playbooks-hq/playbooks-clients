import { CliClient } from 'src/services/cli-client';
import { identifier, listParams } from 'src/utils/cli-input';

export const getTemplate = async (options: any) => {
	const client = new CliClient();
	const path = `/templates/${identifier(options['template'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
