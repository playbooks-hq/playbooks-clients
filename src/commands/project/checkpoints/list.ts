import { projectContext } from 'src/services/command-context';
import { listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listCheckpoints = async (options: any) => {
	const params = listParams(options, { pageBase: 1 });
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/checkpoints`;
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
