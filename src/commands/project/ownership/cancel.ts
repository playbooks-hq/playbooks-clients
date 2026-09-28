import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const cancelOwnership = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/ownership-request/${identifier(options['request'])}/cancel`;
	const params = {};
	await confirm(options, 'Cancel a pending Project ownership request.: ' + path + '?');
	const response = await client.request(path, 'POST', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
