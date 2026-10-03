import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const rollbackRelease = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		project: context.projectResource.uuid,
		release: options.release,
	});
	const data = await input(options, ['currentReleaseId']);
	await confirm(options, 'Restore release code; application data is not rolled back.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.releases.rollback(identifier(options['release']), data));
	assertOperationSucceeded(response, target);
	return response;
};
