import { workspaceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const moveProject = async (options: any) => {
	const id = identifier(options.project, '--project');
	const context = await workspaceContext(options);
	const { client } = context;
	const path = `/workspace/projects/${id}/folder`;
	const params = {};
	const data = await input(options, ['folderId']);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
