import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateCollaborator = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		collaborator: options.collaborator,
	});
	const data = await input(options, ['role']);
	await confirm(options, 'Update Project collaborator access.: ' + target + '?');
	const response = sdkEnvelope(
		await context.projectResource.collaborators.update(identifier(options['collaborator']), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
