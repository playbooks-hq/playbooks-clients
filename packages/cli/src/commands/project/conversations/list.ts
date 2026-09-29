import { projectContext } from 'src/services/command-context';
export const listConversations = async (options: any) => {
	const context = await projectContext(options);
	return context.client.request(`${context.path}/conversations`, 'GET', undefined, {}, false);
};
