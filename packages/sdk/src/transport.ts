import { setTimeout as delay } from 'node:timers/promises';

import { name, version } from '../package.json';
import { PlaybooksError } from './error.js';
import type { ClientOptions } from './types.js';

export class Transport {
	readonly token?: string;
	readonly workspace?: string;
	readonly baseUrl: string;
	readonly clientHeader: string;
	constructor(options: ClientOptions = {}, workspace?: string, clientHeader = `${name}@${version}`) {
		this.token = options.apiKey;
		this.workspace = workspace;
		this.baseUrl = options.baseUrl ?? 'https://api.playbooks.ai';
		this.clientHeader = clientHeader;
	}

	private url(path: string, params: Record<string, any> = {}) {
		const url = new URL(this.baseUrl.replace(/\/$/, '') + path);
		if (url.username || url.password || url.search || url.hash)
			throw new PlaybooksError(400, 'The API origin must not contain credentials, query parameters, or a fragment.');
		if (this.token && !/^[\x21-\x7e]+$/.test(this.token))
			throw new PlaybooksError(401, 'The credential contains invalid characters.');
		if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
			throw new PlaybooksError(400, 'The API endpoint must use HTTPS.');
		for (const [key, value] of Object.entries(params))
			if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
		return url;
	}

	async openStream(path: string, signal: AbortSignal) {
		const response = await fetch(this.url(path), {
			redirect: 'error',
			signal,
			headers: {
				client: this.clientHeader,
				accept: 'text/event-stream',
				...(this.token ? { authorization: this.token } : {}),
				...(this.workspace ? { workspace: this.workspace } : {}),
			},
		});
		if (!response.ok) {
			const body = await response.json().catch(() => null);
			throw new PlaybooksError(
				response.status,
				body?.error?.description || `HTTP ${response.status}`,
				body?.error?.source,
				body?.error?.debug,
				body?.error?.title,
			);
		}
		if (response.headers.get('content-type')?.split(';')[0].trim() !== 'text/event-stream' || !response.body) {
			await response.body?.cancel();
			throw new PlaybooksError(502, 'The server did not return an event stream.');
		}
		return response.body;
	}

	async request(
		path: string,
		method = 'GET',
		data?: object,
		params: Record<string, any> = {},
		readOnly = method === 'GET',
		binary = false,
		raw = false,
		signal?: AbortSignal,
	) {
		const url = this.url(path, params);
		for (let attempt = 0; ; attempt++) {
			const response = await fetch(url, {
				method,
				redirect: 'error',
				signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000),
				headers: {
					client: this.clientHeader,
					accept: binary ? 'application/octet-stream' : 'application/json',
					...(data && !(data instanceof FormData) ? { 'content-type': 'application/json' } : {}),
					...(this.token ? { authorization: this.token } : {}),
					...(this.workspace ? { workspace: this.workspace } : {}),
				},
				body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
			}).catch(() => {
				throw new PlaybooksError(
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
					throw new PlaybooksError(response.status, 'Server is busy. Retry later.');
				await delay(Math.max(0, seconds) * 1000, undefined, { signal });
				continue;
			}
			if (binary && response.ok) return Buffer.from(await response.arrayBuffer());
			if (response.status === 204) return { data: null };
			const body = await response.json().catch(() => null);
			if (!response.ok) {
				const error = body?.error;
				throw new PlaybooksError(
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
				throw new PlaybooksError(502, 'The server returned an invalid response envelope.');
			return body;
		}
	}
}
