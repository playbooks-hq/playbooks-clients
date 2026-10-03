import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getProjectUsage = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(await projectResource.usage.get());
};
export const getProjectBudget = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(await projectResource.budget.get());
};
export const updateProjectBudget = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const data = await input(options, [
		'creditBudget',
		'budgetStopNewWork',
		'budgetAlertThresholds',
		'budgetRecipientMode',
		'budgetRecipientIds',
		'budgetEmail',
	]);
	await confirm(options, `Update budget for ${projectResource.uuid}? Ancestor limits continue to apply.`);
	return sdkEnvelope(await projectResource.budget.update(data));
};
