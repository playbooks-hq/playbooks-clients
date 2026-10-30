import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const downloadWorkspaceReference = async (options: any) => {
	const context = await workspaceContext(options);
	if (typeof options.output !== 'string')
		throw new CliError(422, 'Provide a destination with --output. Existing files are never overwritten.');
	const response = await context.workspaceResource.references.download(identifier(options.reference));
	await writeFile(options.output, response, { flag: 'wx', mode: 0o600 });
	return { data: { path: options.output, bytes: response.length } };
};
