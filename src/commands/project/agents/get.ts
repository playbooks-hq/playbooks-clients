import { projectContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const getAgent = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/agents/${identifier(options['agent'])}`;
	const params = options.include ? listParams({ include: options.include }) : {};
	return client.request(path, 'GET', undefined, params, true);
};
