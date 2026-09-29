import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const rollbackRelease = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/releases/${identifier(options['release'])}/rollback`;
	const params = {};
	const data = await input(options, ['currentReleaseId']);
	await confirm(options, 'Restore release code; application data is not rolled back.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
