import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateAgent = async (options: any) => {
	const context = await projectContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project, agent: options.agent });
	const data = await input(options, ['status', 'revision']);
	await confirm(options, 'Enable or disable a Project Agent.: ' + target + '?');
	const response = sdkEnvelope(await context.projectResource.agents.update(identifier(options['agent']), data));
	assertOperationSucceeded(response, target);
	return response;
};
