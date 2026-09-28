import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input, listParams } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const updateBudgetOperations = async (options: any) => {
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/budget';
	const params = options.include ? listParams({ include: options.include }) : {};
	const data = await input(options, [
		'creditBudget',
		'budgetStopNewWork',
		'budgetAlertThresholds',
		'budgetRecipientMode',
		'budgetRecipientIds',
		'budgetEmail',
	]);
	await confirm(options, 'Update the Workspace credit budget.: ' + path + '?');
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
