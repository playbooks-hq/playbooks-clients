import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const runWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		workflow: options.workflow,
	});
	await confirm(
		options,
		'Run saved work now; may send notifications, change external systems, and incur usage charges.: ' + target + '?',
	);
	const response = sdkEnvelope(await context.projectResource.workflows.run(identifier(options['workflow'])));
	assertOperationSucceeded(response, target);
	return response;
};
