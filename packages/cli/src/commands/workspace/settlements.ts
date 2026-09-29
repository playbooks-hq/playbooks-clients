import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';
export const settlementsOperations = async (options: any) => {
	const params = listParams(options, { sort: ['id', 'createdAt', 'updatedAt'] });
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.settlements.list(params));
};
export const settlementOperations = async (settlementId: string, options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.settlements.get(identifier(settlementId)));
};
