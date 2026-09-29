import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';

export const connectSource = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/source-control/connect`;
	const params = {};
	const data = await input(options, [
		'provider',
		'githubInstallationId',
		'githubRepositoryId',
		'workspaceConnectorId',
		'workspace',
		'repository',
		'repositoryId',
		'namespaceId',
		'repositoryName',
		'subdirectory',
		'preserveSource',
	]);
	await confirm(
		options,
		'Connect a repository; source may be replaced unless preserveSource is supported and selected.: ' + path + '?',
	);
	const response = await client.request(path, 'PUT', data, params, false);
	assertOperationSucceeded(response, path);
	return response;
};
