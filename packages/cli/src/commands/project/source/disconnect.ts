import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const disconnectSource = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	await confirm(options, 'Disconnect the Project repository.: ' + target + '?');
	return sdkEnvelope(await context.projectResource.source.disconnect());
};
