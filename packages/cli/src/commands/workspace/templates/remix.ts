import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const remixTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const data = await input(options, ['versionId', 'idempotencyKey', 'name']);
	const target = JSON.stringify({
		workspace: context.workspaceUuid,
		template: options.template,
		versionId: data.versionId,
	});
	await confirm(options, 'Create an independent resource from this Template version: ' + target + '?');
	const response = sdkEnvelope(await context.workspaceResource.templates.remix(identifier(options.template), data));
	assertOperationSucceeded(response, target);
	return response;
};
