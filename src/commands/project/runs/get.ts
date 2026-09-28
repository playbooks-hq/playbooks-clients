import { projectContext } from 'src/services/command-context';
import { integerOption } from 'src/utils/cli-input';
export const getRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	const context = await projectContext(options);
	return context.client.request(`${context.path}/operator/runs/${id}`);
};
