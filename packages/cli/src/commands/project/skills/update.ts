import { projectContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateProjectSkill = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/resources/library/skills/${identifier(options['skill'])}`;
	const params = {};
	const data = await input(options, ['name', 'files', 'revision']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
