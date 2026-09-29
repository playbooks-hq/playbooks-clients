import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const markAllInboxRead = async (options: any) => {
	const context = await workspaceContext(options);
	await confirm(options, 'Mark all accessible Inbox conversations read for your account in this Workspace?');
	return sdkEnvelope(await context.workspaceResource.inbox.markAllRead());
};
