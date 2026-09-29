import { workspaceContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateRecord = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, domain: options.domain, record: options.record });
	const data = await input(options, ['type', 'name', 'value', 'ttl', 'priority', 'port', 'weight']);
	await confirm(options, 'Update a DNS record.: ' + target + '?');
	const response = sdkEnvelope(
		await context.workspaceResource.domains
			.records(identifier(options['domain']))
			.update(identifier(options.record), data),
	);
	assertOperationSucceeded(response, target);
	return response;
};
