import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listTypes = async (options: any) => {
	const params = listParams(options, {
		sort: ['id', 'name', 'createdAt', 'updatedAt', 'position'],
	});
	const client = new CliClient();
	return sdkList(await client.types.list(params));
};
