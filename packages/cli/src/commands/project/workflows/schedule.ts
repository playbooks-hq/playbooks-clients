import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const scheduleWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: options.project,
		workflow: options.workflow,
	});
	const data = await input(options, ['enabled', 'recurrence', 'time', 'timezone', 'actingUserId']);
	await confirm(options, 'Update recurrence; enabling it authorizes real actions and usage charges.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.workflows.schedule(identifier(options['workflow']), data));
	assertOperationSucceeded(response, target);
	return response;
};
