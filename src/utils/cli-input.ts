import { CliError } from 'src/services/cli-client';

export const readStdin = async () => {
	let text = '';
	process.stdin.setEncoding('utf8');
	for await (const chunk of process.stdin) {
		text += chunk;
		if (Buffer.byteLength(text) > 1024 * 1024) throw new CliError(422, 'Input exceeds 1 MB.');
	}
	return text;
};

export const input = async (options: any, fields: string[]) => {
	if (typeof options.data !== 'string') throw new CliError(422, 'Provide a JSON object with --data <json|->.');
	const text = options.data === '-' ? await readStdin() : options.data;
	if (Buffer.byteLength(text) > 1024 * 1024) throw new CliError(422, 'Input exceeds 1 MB.');
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		throw new CliError(422, 'Input must be a valid JSON object.');
	}
	if (!data || Array.isArray(data) || typeof data !== 'object') throw new CliError(422, 'Input must be a JSON object.');
	const unknown = Object.keys(data).filter(key => !fields.includes(key));
	if (unknown.length)
		throw new CliError(422, `Unsupported properties. Allowed: ${fields.length ? fields.join(', ') : 'none'}.`);
	return data;
};

export const identifier = (value: any, flag?: string) => {
	if (Number.isSafeInteger(value) && value > 0) value = String(value);
	if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value))
		throw new CliError(422, flag ? `Provide a valid identifier with ${flag}.` : 'Provide a valid resource identifier.');
	return encodeURIComponent(value);
};

export const integerOption = (value: any, flag: string, min: number, max = Number.MAX_SAFE_INTEGER) => {
	if ((typeof value !== 'string' && typeof value !== 'number') || !/^\d+$/.test(String(value)))
		throw new CliError(422, `Invalid --${flag}.`);
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < min || number > max) throw new CliError(422, `Invalid --${flag}.`);
	return number;
};

export const textOption = (value: any, flag: string) => {
	if (typeof value !== 'string' || !value.trim()) throw new CliError(422, `--${flag} requires a value.`);
	return value;
};

export const includeParams = (options: any, relations: string[]): Record<string, any> => {
	if (options.include === undefined) return {};
	const values = textOption(options.include, 'include')
		.split(',')
		.map(value => value.trim());
	if (values.some(value => !relations.includes(value)))
		throw new CliError(422, `Allowed --include relations: ${relations.join(', ')}.`);
	return { include: [...new Set(values)].join(',') };
};

export const availableParams = (options: any) => {
	if (options.available === undefined) return {};
	if (typeof options.available !== 'boolean') throw new CliError(422, '--available does not accept a value.');
	return options.available ? { available: true } : {};
};

export const listParams = (
	options: any,
	config: {
		search?: boolean;
		pagination?: boolean;
		sort?: string[];
		librarySort?: boolean;
		pageBase?: 1;
		pageSizeMax?: number;
	} = {},
) => {
	const params: Record<string, any> = {};
	for (const [flag, key] of [
		['page', 'page'],
		['page-size', 'pageSize'],
	]) {
		if (config.pagination === false || options[flag] === undefined) continue;
		params[key] = integerOption(
			options[flag],
			flag,
			flag === 'page' ? 0 : 1,
			flag === 'page-size' ? config.pageSizeMax : undefined,
		);
	}
	if (config.pageSizeMax && !Number.isSafeInteger((params.page ?? 0) * (params.pageSize ?? 20)))
		throw new CliError(422, 'Invalid pagination offset.');
	// Model-backed endpoints use one-based pages; resource libraries use zero-based pages.
	if (config.pageBase === 1) {
		params.page = integerOption(params.page ?? 0, 'page', 0, Number.MAX_SAFE_INTEGER - 1) + 1;
	}
	if (config.search !== false && options.query !== undefined) params.query = textOption(options.query, 'query');
	if (options.sort !== undefined && config.librarySort) {
		if (!['name:asc', 'updatedAt:desc'].includes(options.sort))
			throw new CliError(422, 'Allowed --sort values: name:asc, updatedAt:desc.');
		params.sort = options.sort.split(':')[0];
	} else if (options.sort !== undefined && config.sort) {
		const parts = textOption(options.sort, 'sort').split(':');
		if (parts.length !== 2 || !config.sort.includes(parts[0]) || !['asc', 'desc'].includes(parts[1]))
			throw new CliError(422, `Use --sort <field:asc|desc>. Allowed fields: ${config.sort.join(', ')}.`);
		[params.sortProp, params.sortValue] = parts;
	}
	return params;
};

export const zeroBasedPage = (response: any) => {
	if (response.meta?.page !== undefined) response.meta.page -= 1;
	return response;
};
