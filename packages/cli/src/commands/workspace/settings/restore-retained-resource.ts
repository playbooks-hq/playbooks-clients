import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const restoreRetainedResource = async (options: any) => {
	const context = await workspaceContext(options);
	const type = options.type;
	if (!['chat', 'agent', 'project', 'site', 'artifact'].includes(type))
		throw new Error('Choose chat, agent, project, site, or artifact.');
	const resourceId = identifier(options.resource);
	await confirm(options, `Restore retained ${type} ${resourceId} in Workspace ${context.workspaceUuid}?`);
	return sdkEnvelope(await context.workspaceResource.retainedResources.restore(type, resourceId));
};
