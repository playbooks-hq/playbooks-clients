import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateAgent = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/agents/${identifier(options['agent'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['status', 'revision']);
	await confirm(options, 'Enable or disable a Project Agent.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
