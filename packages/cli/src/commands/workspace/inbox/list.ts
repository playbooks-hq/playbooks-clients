import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier, listParams, textOption } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listInbox = async (options: any) => {
	const params = listParams(options, { search: false, pageSizeMax: 100 });
	for (const [flag, allowed] of [
		['view', ['attention', 'mentions', 'all']],
		['type', ['all', 'approval', 'question', 'review', 'failure', 'mention', 'reply', 'report']],
	] as const) {
		if (options[flag] === undefined) continue;
		const value = textOption(options[flag], flag);
		if (!(allowed as readonly string[]).includes(value))
			throw new CliError(422, `Allowed --${flag} values: ${allowed.join(', ')}.`);
		params[flag] = value;
	}
	if (options.scope !== undefined) {
		const scope = textOption(options.scope, 'scope');
		if (!['all', 'workspace'].includes(scope) && !/^(project|folder):[a-zA-Z0-9_-]+$/.test(scope))
			throw new CliError(422, 'Use --scope all, workspace, project:<uuid>, or folder:<uuid>.');
		params.scope = scope;
	}
	if (options.search !== undefined) params.search = textOption(options.search, 'search');
	if (options.conversation !== undefined) params.conversation = identifier(options.conversation, '--conversation');
	const context = await workspaceContext(options);
	return sdkList(await context.workspaceResource.inbox.list(params));
};
