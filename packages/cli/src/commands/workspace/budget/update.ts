import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateBudgetOperations = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid });
	const data = await input(options, [
		'creditBudget',
		'budgetStopNewWork',
		'budgetAlertThresholds',
		'budgetRecipientMode',
		'budgetRecipientIds',
		'budgetEmail',
	]);
	await confirm(options, 'Update the Workspace credit budget.: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.budget.update(data));
	assertOperationSucceeded(response, target);
	return response;
};
