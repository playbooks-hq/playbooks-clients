import { projectContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const renameCheckpoint = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		checkpoint: options.checkpoint,
	});
	const data = await input(options, ['label']);
	const response = sdkEnvelope(
		await context.projectResource.checkpoints.rename(identifier(options['checkpoint']), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
