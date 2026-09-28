import { CliError } from 'src/services/cli-client';
import { serializeAttrs } from 'src/utils/serialize';

export const redact = (value: any): any => {
	if (Array.isArray(value)) return value.map(redact);
	if (!value || typeof value !== 'object') return value;
	return Object.fromEntries(
		Object.entries(value).map(([key, item]) => [
			key,
			/^(token|accessToken|refreshToken|password|authorization|credentialData|secret|secretValue|apiKey|privateKey)$/i.test(
				key,
			)
				? '[redacted]'
				: redact(item),
		]),
	);
};

export const output = (response: any, options: any) => {
	const result = redact(response);
	if (options.select && options.select !== '*' && result.data !== null) {
		const fields = String(options.select)
			.split(',')
			.map(value => value.trim());
		result.data = Array.isArray(result.data)
			? result.data.map(item => serializeAttrs(item, fields))
			: serializeAttrs(result.data, fields);
	}
	if (options.json || !process.stdout.isTTY) return console.log(JSON.stringify(result, null, 2));
	if (options.select) return console.log(JSON.stringify(result, null, 2));
	if (Array.isArray(result.data)) {
		if (!result.data.length) console.log('No records.');
		else if (result.data.some(record => record === null || typeof record !== 'object'))
			console.log(JSON.stringify(result.data, null, 2));
		else
			console.table(
				result.data.map(record =>
					Object.fromEntries(
						Object.entries(record).filter(
							([key, value]) =>
								['id', 'uuid', 'name', 'status', 'role', 'description'].includes(key) && typeof value !== 'object',
						),
					),
				),
			);
		if (result.meta?.totalRecords !== undefined)
			console.log(`Page ${result.meta.page} | ${result.meta.totalRecords} records`);
	} else console.log(JSON.stringify(result.data, null, 2));
};

export const reportError = (error: any) => {
	const status = error instanceof CliError ? error.status : 500;
	console.error(
		JSON.stringify(
			{
				error: {
					status,
					title: error instanceof CliError ? error.title : 'CLI Error',
					description: error.message || 'The command failed.',
					...(error.source ? { source: error.source } : {}),
					...(error.debug ? { debug: error.debug } : {}),
				},
			},
			null,
			2,
		),
	);
	process.exitCode = status === 400 || status === 422 ? 2 : 1;
};
