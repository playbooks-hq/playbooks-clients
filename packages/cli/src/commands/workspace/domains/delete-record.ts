import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const deleteRecord = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, domain: options.domain, record: options.record });
	await confirm(options, 'Delete a DNS record.: ' + target + '?');
	const response = sdkEnvelope(
		await context.workspaceResource.domains.records(identifier(options['domain'])).delete(identifier(options.record)),
	);
	assertOperationSucceeded(response, target);
	return response;
};
