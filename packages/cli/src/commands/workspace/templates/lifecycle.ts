import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const templateLifecycle =
	(operation: 'unpublish' | 'archive' | 'restore' | 'delete') => async (options: any) => {
		const id = identifier(options.template, '--template');
		if (options.yes !== true) throw new CliError(422, `Review Template ${id}, then confirm ${operation} with --yes.`);
		if (options.data !== undefined) await input(options, []);
		const { workspaceResource } = await workspaceContext(options);
		const result = await workspaceResource.templates[operation === 'restore' ? 'unarchive' : operation](id);
		return sdkEnvelope(result ?? { template: id, action: operation });
	};
