import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const deleteSchedule = async (options: any) => {
	const context = await projectContext(options);
	const data = await input(options, ['revision']);
	await confirm(
		options,
		`Delete scheduled message ${options.schedule} in Project ${context.projectResource.uuid}, Workspace ${context.workspaceUuid}?`,
	);
	return sdkEnvelope(await context.projectResource.schedules.delete(identifier(options.schedule), data));
};
