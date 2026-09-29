import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listRecords = async (options: any) => {
	const context = await workspaceContext(options);
	const params = listParams(options, { search: false });
	return sdkList(await context.workspaceResource.domains.records(identifier(options['domain'])).list(params));
};
