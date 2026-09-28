import { authenticated } from 'src/services/command-context';

export const clearWorkspace = async (options: any) => {
	const { store } = await authenticated(options);
	await store.write({ version: 1 });
	return { data: { workspace: null, project: null } };
};
