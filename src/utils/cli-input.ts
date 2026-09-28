import { readFile } from 'node:fs/promises';

import { CliError } from 'src/services/cli-client';

export const readStdin = async () => {
	let text = '';
	for await (const chunk of process.stdin) {
		text += chunk;
		if (Buffer.byteLength(text) > 1024 * 1024) throw new CliError(422, 'Input exceeds 1 MB.');
	}
	return text;
};

export const input = async (options: any, fields: string[]) => {
	if (typeof options.file !== 'string') throw new CliError(422, 'Provide a JSON object with --file <path|->.');
	let data;
	try {
		data = JSON.parse(options.file === '-' ? await readStdin() : await readFile(options.file, 'utf8'));
	} catch {
		throw new CliError(422, 'Input must be a valid JSON object.');
	}
	if (!data || Array.isArray(data) || typeof data !== 'object') throw new CliError(422, 'Input must be a JSON object.');
	const unknown = Object.keys(data).filter(key => !fields.includes(key));
	if (unknown.length)
		throw new CliError(422, `Unsupported fields: ${unknown.join(', ')}. Allowed: ${fields.join(', ')}.`);
	return data;
};

export const identifier = (value: any) => {
	if (Number.isSafeInteger(value) && value > 0) value = String(value);
	if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(value))
		throw new CliError(422, 'Provide a valid resource identifier.');
	return encodeURIComponent(value);
};

export const listParams = (options: any) => {
	const params: Record<string, any> = {};
	for (const [flag, key] of [
		['page', 'page'],
		['page-size', 'pageSize'],
	]) {
		if (options[flag] === undefined) continue;
		const value = Number(options[flag]);
		if (!Number.isInteger(value) || value < (flag === 'page' ? 0 : 1)) throw new CliError(422, `Invalid --${flag}.`);
		params[key] = value;
	}
	for (const key of ['query', 'include', 'status'])
		if (options[key] !== undefined) {
			if (typeof options[key] !== 'string') throw new CliError(422, `--${key} requires a value.`);
			params[key] = options[key];
		}
	if (options.sort) {
		const match = /^([a-zA-Z][a-zA-Z0-9]*):(asc|desc)$/.exec(options.sort);
		if (!match) throw new CliError(422, 'Use --sort field:asc or field:desc.');
		params.sortProp = match[1];
		params.sortValue = match[2];
	}
	return params;
};
