import { CliError } from 'src/services/cli-client';

export const assertOperationSucceeded = (response: any, path: string) => {
	if (response.data?.status === 'failed')
		throw new CliError(
			422,
			'The operation failed. Inspect its receipt before retrying.',
			path,
			String(response.data.uuid || response.data.id || ''),
		);
};
