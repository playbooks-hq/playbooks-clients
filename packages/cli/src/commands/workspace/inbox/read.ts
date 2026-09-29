import { workspaceContext } from 'src/services/command-context';
import { identifier, input, integerOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const markInboxRead = async (options: any) => {
	const conversation = identifier(options.conversation, '--conversation');
	const data = await input(options, ['branchId', 'throughMessageId']);
	data.throughMessageId = integerOption(data.throughMessageId, 'data.throughMessageId', 1);
	if (data.branchId !== undefined && data.branchId !== null)
		data.branchId = integerOption(data.branchId, 'data.branchId', 1);
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.inbox.markRead(conversation, data));
};
