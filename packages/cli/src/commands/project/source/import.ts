import { openAsBlob } from 'node:fs';
import path from 'node:path';

import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const importSource = async (options: any) => {
	if (!options.yes || typeof options.upload !== 'string')
		throw new CliError(422, 'Provide a source zip with --upload and confirm replacement with --yes.');
	const context = await projectContext(options);
	const blob = await openAsBlob(options.upload);
	return sdkEnvelope(
		await context.projectResource.source.import({ content: blob, name: path.basename(options.upload) }),
	);
};
