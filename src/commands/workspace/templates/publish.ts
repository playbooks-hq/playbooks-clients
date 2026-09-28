import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const publishTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}/publish`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = !options.file ? {} : await input(options, []);
	await confirm(options, 'Publish a Template version to the marketplace.: ' + path + '?');
	const response = await client.request(path, 'POST', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
