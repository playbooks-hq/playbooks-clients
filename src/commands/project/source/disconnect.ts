import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { listParams } from 'src/utils/cli-input';

export const disconnectSource = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/source-control/disconnect`;
	const params = options.include ? listParams({ include: options.include }) : {};
	await confirm(options, 'Disconnect the Project repository.: ' + path + '?');
	return client.request(path, 'GET', undefined, params, false);
};
