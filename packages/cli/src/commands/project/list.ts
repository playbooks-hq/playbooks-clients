import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier, includeParams, integerOption, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listProjects = async (options: any) => {
	const params = {
		...listParams(options, { sort: ['id', 'name', 'createdAt', 'updatedAt'] }),
		...includeParams(options, ['folder', 'type', 'projectOwner', 'branches', 'deploy']),
	};
	if (options.owner !== undefined) params.projectOwnerId = integerOption(options.owner, 'owner', 1);
	const folderId = options.folder === undefined ? undefined : identifier(options.folder, '--folder');
	const context = await workspaceContext(options);
	if (folderId !== undefined) {
		const folder = sdkEnvelope(await context.workspaceResource.folders.get(folderId));
		if (folder.data?.uuid !== folderId || !Number.isSafeInteger(folder.data?.id) || folder.data.id < 1)
			throw new CliError(502, 'The server returned an invalid folder identity.');
		params.folderId = folder.data.id;
	}
	return sdkList(await context.workspaceResource.projects.list(params));
};
