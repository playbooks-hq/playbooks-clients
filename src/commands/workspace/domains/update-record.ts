import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateRecord = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/domains/${identifier(options['domain'])}/dns-records/${identifier(options.record)}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['type', 'name', 'value', 'ttl', 'priority', 'port', 'weight']);
	await confirm(options, 'Update a DNS record.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
