import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createSchedule = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: context.projectResource.uuid });
	const data = await input(options, [
		'name',
		'instructions',
		'references',
		'modelId',
		'branchId',
		'destination',
		'destinationConversationId',
		'enabled',
		'recurrence',
		'time',
		'timezone',
	]);
	if (data.enabled)
		await confirm(options, 'Enable this scheduled message and authorize its future usage: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.schedules.create(data));
	assertOperationSucceeded(response, target);
	return response;
};
