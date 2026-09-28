import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const deleteRecord = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/domains/${identifier(options['domain'])}/dns-records/${identifier(options.record)}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	await confirm(options, 'Delete a DNS record.: ' + path + '?');
	const response = await client.request(path, 'DELETE', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
