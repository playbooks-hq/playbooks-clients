import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const useProject = async (options: any) => {
	const context = await workspaceContext(options);
	const result = await context.client.request(`/workspace/projects/${identifier(options['project'])}`);
	await context.store.write({ ...context.state, project: result.data.uuid });
	return result;
};
