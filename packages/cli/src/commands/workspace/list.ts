import { authenticated } from 'src/services/command-context';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listWorkspace = async (options: any) => {
	const { client } = await authenticated(options);
	return sdkList(await client.workspaces.list(listParams(options, { search: false })));
};
