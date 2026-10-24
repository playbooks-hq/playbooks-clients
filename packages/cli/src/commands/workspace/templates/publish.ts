import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const publishTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, template: options.template });
	const data = await input(options, ['acknowledgment', 'notes', 'bump', 'action']);
	await confirm(options, 'Publish the reviewed Template package: ' + target + '?');
	const response = sdkEnvelope(
		await context.workspaceResource.templates.publish(identifier(options['template']), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
