import { STATUS_CODES } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

import { name, version } from '../../package.json';

export const apiURL = () =>
	process.env.PLAYBOOKS_API_URL || import.meta.env.VITE_BASE_URL || 'https://api.playbooks.ai';

export class CliError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly source?: string,
		readonly debug?: string,
		readonly title = STATUS_CODES[status] || 'Request Failed',
	) {
		super(message);
	}
}

export class CliClient {
	constructor(
		readonly token?: string,
		readonly workspace?: string,
	) {}

	async request(
		path: string,
		method = 'GET',
		data?: object,
		params: Record<string, any> = {},
		readOnly = method === 'GET',
		binary = false,
		raw = false,
	) {
		const base = apiURL();
		const url = new URL(base.replace(/\/$/, '') + path);
		if (url.username || url.password || url.search || url.hash)
			throw new CliError(400, 'The API origin must not contain credentials, query parameters, or a fragment.');
		if (this.token && !/^[\x21-\x7e]+$/.test(this.token))
			throw new CliError(401, 'The credential contains invalid characters.');
		if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
			throw new CliError(400, 'The API endpoint must use HTTPS.');
		}
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
		}
		for (let attempt = 0; ; attempt++) {
			const response = await fetch(url, {
				method,
				redirect: 'error',
				signal: AbortSignal.timeout(30000),
				headers: {
					client: `${name}@${version}`,
					accept: binary ? 'application/octet-stream' : 'application/json',
					...(data && !(data instanceof FormData) ? { 'content-type': 'application/json' } : {}),
					...(this.token ? { authorization: this.token } : {}),
					...(this.workspace ? { workspace: this.workspace } : {}),
				},
				body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
			}).catch(() => {
				throw new CliError(
					503,
					readOnly
						? 'The API request could not complete. Check connectivity and try again.'
						: 'The request could not complete. The server may have accepted it; inspect resource state before retrying.',
				);
			});
			if (readOnly && attempt < 2 && [429, 502, 503, 504].includes(response.status)) {
				await response.body?.cancel();
				const retry = response.headers.get('retry-after');
				const seconds = retry ? Number(retry) : attempt + 1;
				if (!Number.isFinite(seconds) || seconds > 10)
					throw new CliError(response.status, 'Server is busy. Retry later.');
				await delay(Math.max(0, seconds) * 1000);
				continue;
			}
			if (binary && response.ok) return Buffer.from(await response.arrayBuffer());
			if (response.status === 204) return { data: null };
			const body = await response.json().catch(() => null);
			if (!response.ok) {
				const error = body?.error;
				throw new CliError(
					response.status,
					error?.description || `HTTP ${response.status}: ${response.statusText}`,
					error?.source,
					error?.debug,
					error?.title,
				);
			}
			if (raw) return { data: body };
			if (method !== 'GET' && body && Object.keys(body).length === 0) return { data: null };
			if (!body || typeof body !== 'object' || !('data' in body))
				throw new CliError(502, 'The server returned an invalid response envelope.');
			return body;
		}
	}
}
