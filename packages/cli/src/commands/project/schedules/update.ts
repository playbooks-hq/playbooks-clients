import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateSchedule = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		schedule: options.schedule,
	});
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
		'revision',
	]);
	await confirm(options, 'Update the saved scheduled message and its timing.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.schedules.update(identifier(options['schedule']), data));
	assertOperationSucceeded(response, target);
	return response;
};
