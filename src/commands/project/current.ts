import { projectContext } from 'src/services/command-context';

export const currentProject = async (options: any) => {
	return (await projectContext(options)).project;
};
