import { workspaceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const updateTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, template: options.template });
	const data = await input(options, [
		'name',
		'tagline',
		'description',
		'cover',
		'thumbnail',
		'licenseId',
		'categoryIds',
	]);
	const response = sdkEnvelope(await context.workspaceResource.templates.update(identifier(options['template']), data));
	assertOperationSucceeded(response, target);
	return response;
};
