import { projectContext } from 'src/services/command-context';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateProjectPreferences = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/preferences`;
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, [
		'opinionPolicy',
		'modelId',
		'mode',
		'permissions',
		'instructions',
		'deliveryMode',
		'inferenceProviderMode',
		'inferenceProjectConnectorId',
		'revision',
	]);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
