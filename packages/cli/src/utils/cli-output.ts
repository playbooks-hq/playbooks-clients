import boxen from 'boxen';
import { CliError } from 'src/services/cli-client';
import { serializeAttrs } from 'src/utils/serialize';
import { terminalText } from 'src/utils/terminal-text';

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

const displayFields = (record: Record<string, unknown>, indent = ''): string => {
	const lines: string[] = [];
	const fields = Object.entries(record).map(([key, value]) => {
		const label = terminalText(key.replace(/([a-z])([A-Z])/g, '$1 $2'));
		const title = /^(id|uuid)$/i.test(label) ? label.toUpperCase() : label.charAt(0).toUpperCase() + label.slice(1);
		return { title, value };
	});
	const width = fields.reduce((max, field) => Math.max(max, Math.min(30, field.title.length)), 0);
	for (const { title, value } of fields) {
		if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length) {
			lines.push(indent + title);
			lines.push(displayFields(value as Record<string, unknown>, indent + '  '));
		} else {
			const text = typeof value === 'string' ? value : JSON.stringify(value);
			lines.push(indent + title.padEnd(width) + '  ' + terminalText(text ?? ''));
		}
	}
	return lines.join('\n');
};

const panel = (title: string, body: string) =>
	boxen(body, { title, borderStyle: 'round', padding: { left: 1, right: 1, top: 0, bottom: 0 } });

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
	} else {
		if (options.commandTitle === 'status' && result.data?.user?.name && result.data.credentialSource) {
			const sources = {
				browserSession: 'Browser session',
				storedDeveloperKey: 'Stored developer key',
				environmentDeveloperKey: 'Environment developer key',
			};
			console.log(
				panel(
					'Session',
					displayFields({
						account: result.data.user.name,
						signedInWith: sources[result.data.credentialSource] || result.data.credentialSource,
						...(result.data.workspace ? { workspace: result.data.workspace } : {}),
					}),
				),
			);
			return;
		}
		const name = options.commandTitle || 'Result';
		const body =
			result.data && typeof result.data === 'object' && Object.keys(result.data).length
				? displayFields(result.data)
				: JSON.stringify(result.data, null, 2);
		console.log(panel(name.charAt(0).toUpperCase() + name.slice(1), body ?? ''));
	}
};

export const reportError = (error: any, options?: any) => {
	const status = error instanceof CliError ? error.status : 500;
	process.exitCode = status === 400 || status === 422 ? 2 : 1;
	if (
		process.stdout.isTTY &&
		process.stderr.isTTY &&
		!(options?.json ?? process.argv.includes('--json')) &&
		!options?.select
	) {
		console.error(panel(`Error ${status}`, terminalText(error.message || 'The command failed.')));
		return;
	}
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
};
