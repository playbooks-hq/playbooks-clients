import { workspaceContext } from 'src/services/command-context';
import { integerOption } from 'src/utils/cli-input';
export const getRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	const context = await workspaceContext(options);
	return context.client.request(`/workspace/operator/runs/${id}`);
};
