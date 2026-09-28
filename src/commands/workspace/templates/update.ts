import { workspaceContext } from 'src/services/command-context';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/templates/${identifier(options['template'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, [
		'name',
		'tagline',
		'description',
		'cover',
		'thumbnail',
		'licenseId',
		'categoryIds',
	]);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
