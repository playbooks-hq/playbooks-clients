import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getResourceRetention = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.resourceRetention.get());
};

export const updateResourceRetention = async (options: any) => {
	const context = await workspaceContext(options);
	const data = await input(options, ['retainDeletedResources30Days']);
	if (typeof data.retainDeletedResources30Days !== 'boolean')
		throw new Error('Provide retainDeletedResources30Days as a boolean.');
	await confirm(options, `Update deleted resource retention for Workspace ${context.workspaceUuid}?`);
	return sdkEnvelope(await context.workspaceResource.resourceRetention.update(data.retainDeletedResources30Days));
};
