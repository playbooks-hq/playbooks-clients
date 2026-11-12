import { CliClient } from 'src/services/cli-client';
import { CliError } from 'src/services/cli-client';
import { workspaceReferenceContext } from 'src/services/command-context';
import { includeParams, listParams, templateKindOption, textOption } from 'src/utils/cli-input';
import { sdkList } from 'src/utils/sdk-output';

export const listTemplates = async (options: any) => {
	const params = {
		...listParams(options),
		...includeParams(options, ['categories', 'license', 'stats']),
	};
	if (options.kind !== undefined) params.kind = templateKindOption(options.kind);
	if (options.category !== undefined) {
		const category = textOption(options.category, 'category');
		if (!/^[a-zA-Z0-9-]+$/.test(category)) throw new CliError(422, 'Provide one category UUID with --category.');
		params.category = category;
	}
	if (options.view !== undefined) {
		const view = textOption(options.view, 'view');
		if (!['discover', 'popular', 'recent', 'following'].includes(view))
			throw new CliError(422, 'Select an available view.');
		params.view = view;
	}
	if (params.view === 'following') {
		const { client, workspaceUuid } = await workspaceReferenceContext(options);
		return sdkList(await client.templates.list({ ...params, workspace: workspaceUuid }));
	}
	if (options.workspace !== undefined) throw new CliError(422, '--workspace applies only to --view following.');
	return sdkList(await new CliClient().templates.list(params));
};
