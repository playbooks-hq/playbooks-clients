import { CliClient } from 'src/services/cli-client';
import { listParams } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listCategories = async (options: any) => {
	const params = listParams(options, { sort: ['id', 'name', 'createdAt', 'updatedAt'] });
	const client = new CliClient();
	return sdkList(await client.categories.list(params));
};
