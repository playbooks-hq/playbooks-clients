import { projectContext } from 'src/services/command-context';
import { openResource } from 'src/utils/open-resource';

export const openProject = async (options: any) => {
	const context = await projectContext(options);
	const response = context.project;
	return openResource(response.data);
};
