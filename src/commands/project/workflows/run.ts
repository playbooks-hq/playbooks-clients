import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const runWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows/${identifier(options['workflow'])}/runs`;
	const params = options.include ? listParams({ include: options.include }) : {};
	await confirm(
		options,
		'Run saved work now; may send notifications, change external systems, and incur usage charges.: ' + path + '?',
	);
	const response = await client.request(path, 'POST', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
