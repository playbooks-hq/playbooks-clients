import { workspaceContext } from 'src/services/command-context';

export const clearProject = async (options: any) => {
	const context = await workspaceContext(options);
	await context.store.write({ version: 1, workspace: context.state.workspace });
	return { data: { project: null } };
};
