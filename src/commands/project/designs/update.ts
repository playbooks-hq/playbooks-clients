import { projectContext } from 'src/services/command-context';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateProjectDesign = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources/library/designs/${identifier(options['design'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['name', 'files', 'revision']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
