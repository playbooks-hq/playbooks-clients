import { projectContext } from 'src/services/command-context';
import { sdkList } from 'src/utils/sdk-output';
export const listConversations = async (options: any) => {
	const context = await projectContext(options);
	return sdkList(await context.projectResource.conversations.list());
};
