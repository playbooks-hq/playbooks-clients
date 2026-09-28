import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const acceptOwnership = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/ownership-request/${identifier(options['request'])}/accept`;
	const params = options.include ? listParams({ include: options.include }) : {};
	await confirm(options, 'Accept a Project ownership request addressed to you.: ' + path + '?');
	const response = await client.request(path, 'POST', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
