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
	if (options.query !== undefined) {
		if (typeof options.query !== 'string') throw new CliError(422, '--query requires a value.');
		params.query = options.query;
	}
	return params;
};
