import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams, integerOption, listParams, zeroBasedPage } from 'src/utils/cli-input';

export const listProjects = async (options: any) => {
	const params = {
		...listParams(options, { pageBase: 1, sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['folder', 'type', 'projectOwner', 'branches', 'deploy']),
	};
	if (options.owner !== undefined) params.projectOwnerId = integerOption(options.owner, 'owner', 1);
	const folderId = options.folder === undefined ? undefined : identifier(options.folder, '--folder');
	const context = await workspaceContext(options);
	const { client } = context;
	const path = '/workspace/projects';
	if (folderId !== undefined) {
		const folder = await client.request(`/workspace/project-folders/${folderId}`);
		if (folder.data?.uuid !== folderId || !Number.isSafeInteger(folder.data?.id) || folder.data.id < 1)
			throw new CliError(502, 'The server returned an invalid folder identity.');
		params.folderId = folder.data.id;
	}
	return zeroBasedPage(await client.request(path, 'GET', undefined, params, true));
};
