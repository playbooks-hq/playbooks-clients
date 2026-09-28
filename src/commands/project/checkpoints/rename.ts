import { projectContext } from 'src/services/command-context';
import { identifier, input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const renameCheckpoint = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/checkpoints/${identifier(options['checkpoint'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, ['label']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
