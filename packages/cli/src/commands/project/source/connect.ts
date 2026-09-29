import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const connectSource = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
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
		'Connect a repository; source may be replaced unless preserveSource is supported and selected.: ' + target + '?',
	);
	const response = sdkEnvelope(await context.projectResource.source.connect(data));
	assertOperationSucceeded(response, target);
	return response;
};
