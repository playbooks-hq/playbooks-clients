import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';

export const downloadProjectFile = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/files/${identifier(options['file-id'])}/download`;
	const params = options.include ? listParams({ include: options.include }) : {};
	if (typeof options.output !== 'string')
		throw new CliError(422, 'Provide a destination with --output. Existing files are never overwritten.');
	const response = await client.request(path, 'GET', undefined, params, true, true);
	await writeFile(options.output, response, { flag: 'wx', mode: 0o600 });
	return { data: { path: options.output, bytes: response.length } };
};
