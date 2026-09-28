import { writeFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';

export const exportProject = async (options: any) => {
	const context = await projectContext(options);
	const { client } = context;
	const path = `${context.path}/download`;
	const params = {};
	if (typeof options.output !== 'string')
		throw new CliError(422, 'Provide a destination with --output. Existing files are never overwritten.');
	const response = await client.request(path, 'GET', undefined, params, false, true);
	await writeFile(options.output, response, { flag: 'wx', mode: 0o600 });
	return { data: { path: options.output, bytes: response.length } };
};
