import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const restoreCheckpoint = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: options.project,
		checkpoint: options.checkpoint,
	});
	await confirm(options, 'Restore a source checkpoint; application data is unchanged.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.checkpoints.restore(identifier(options['checkpoint'])));
	assertOperationSucceeded(response, target);
	return response;
};
