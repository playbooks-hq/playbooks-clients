import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const restoreCheckpoint = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/checkpoints/${identifier(options['checkpoint'])}/restore`;
	const params = {};
	await confirm(options, 'Restore a source checkpoint; application data is unchanged.: ' + path + '?');
	const response = await client.request(path, 'POST', undefined, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
