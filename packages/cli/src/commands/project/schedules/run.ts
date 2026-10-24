import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const runSchedule = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		schedule: options.schedule,
	});
	const data = await input(options, ['revision', 'requestKey']);
	await confirm(
		options,
		'Run saved work now; may send notifications, change external systems, and incur usage charges.: ' + target + '?',
	);
	const response = sdkEnvelope(await context.projectResource.schedules.run(identifier(options['schedule']), data));
	assertOperationSucceeded(response, target);
	return response;
};
