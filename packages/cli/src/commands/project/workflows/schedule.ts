import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const scheduleWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/workflows/${identifier(options['workflow'])}/schedule`;
	const params = {};
	const data = await input(options, ['enabled', 'recurrence', 'time', 'timezone', 'actingUserId']);
	await confirm(options, 'Update recurrence; enabling it authorizes real actions and usage charges.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
