import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateWorkflow = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		workflow: options.workflow,
	});
	const data = await input(options, ['name', 'status', 'steps', 'schedule', 'revision']);
	await confirm(options, 'Update saved workflow steps.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.workflows.update(identifier(options['workflow']), data));
	assertOperationSucceeded(response, target);
	return response;
};
