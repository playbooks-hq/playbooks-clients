import { openAsBlob } from 'node:fs';
import path from 'node:path';

import { CliError } from 'src/services/cli-client';
import { workspaceContext } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const uploadWorkspaceFile = async (options: any) => {
	if (typeof options.upload !== 'string') throw new CliError(422, 'Provide a local file with --upload.');
	const context = await workspaceContext(options);
	const name = options.name || path.basename(options.upload);
	if (
		typeof name !== 'string' ||
		!name ||
		name.includes('\\') ||
		name.startsWith('/') ||
		name.split('/').some(part => !part || part === '..' || part === '.')
	)
		throw new CliError(422, 'Provide a safe relative Reference name.');
	const blob = await openAsBlob(options.upload);
	if (blob.size > 20 * 1024 * 1024) throw new CliError(422, 'References must not exceed 20 MB.');
	return sdkEnvelope(
		await context.workspaceResource.references.upload({
			name,
			content: blob,
			expectedRevision: options.revision || null,
		}),
	);
};
