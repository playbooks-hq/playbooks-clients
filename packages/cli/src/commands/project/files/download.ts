import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';

export const downloadProjectFile = async (options: any) => {
	const context = await projectContext(options);
	if (typeof options.output !== 'string')
		throw new CliError(422, 'Provide a destination with --output. Existing files are never overwritten.');
	const response = await context.projectResource.files.download(identifier(options['file-id']));
	await writeFile(options.output, response, { flag: 'wx', mode: 0o600 });
	return { data: { path: options.output, bytes: response.length } };
};
