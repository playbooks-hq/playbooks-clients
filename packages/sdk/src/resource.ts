import { PlaybooksError } from 'src/error.js';
import type { Transport } from 'src/transport.js';
import type { ApiResponse, ListOptions, RecordData } from 'src/types.js';

export const identifier = (value: unknown) => {
	if (!['string', 'number'].includes(typeof value) || !/^[a-zA-Z0-9_-]+$/.test(String(value)))
		throw new PlaybooksError(422, 'Provide a valid resource identifier.');
	return encodeURIComponent(String(value));
};

/** Own data only: transport and ownership never become serializable fields. */
export class Resource<T extends object> {
	#snapshot: T;
	constructor(data: T) {
		this.#snapshot = structuredClone(data);
		this.replace(data);
	}
	protected replace(data: T) {
		this.#snapshot = structuredClone(data);
		for (const key of Object.keys(data)) {
			if (key in this || ['__proto__', 'prototype', 'constructor'].includes(key)) continue;
			Object.defineProperty(this, key, {
				enumerable: true,
				get: () => structuredClone((this.#snapshot as Record<string, unknown>)[key]),
			});
		}
	}
	toJSON(): T {
		return structuredClone(this.#snapshot);
	}
}

export type RecordResource<T extends object = RecordData> = Resource<T> & Readonly<T>;
export const record = <T extends object>(data: T): RecordResource<T> =>
	data === null || data === undefined ? (data as RecordResource<T>) : (new Resource(data) as RecordResource<T>);

export const succeeded = <T>(data: T, source?: string): T => {
	if ((data as RecordData)?.status === 'failed')
		throw new PlaybooksError(
			422,
			'The operation failed. Inspect its receipt before retrying.',
			source,
			String((data as RecordData).uuid ?? (data as RecordData).id ?? ''),
		);
	return data;
};

export const get = async <T extends object = RecordData>(
	transport: Transport,
	path: string,
	params: object = {},
	readOnly = true,
) => record<T>((await transport.request(path, 'GET', undefined, params, readOnly)).data);

export const action = async <T = RecordData>(
	transport: Transport,
	path: string,
	method: string,
	data?: object,
	params: object = {},
): Promise<T> => succeeded((await transport.request(path, method, data, params, false)).data, path);

export const listing = async <T extends object = RecordData>(
	transport: Transport,
	path: string,
	options: ListOptions = {},
	readOnly = true,
): Promise<ApiResponse<RecordResource<T>[]>> => {
	if (options.page !== undefined && (!Number.isSafeInteger(options.page) || options.page < 0))
		throw new PlaybooksError(422, 'Page must be a nonnegative integer.');
	const response = await transport.request(path, 'GET', undefined, options, readOnly);
	return { ...response, data: response.data.map((data: T) => record(data)) };
};

export class EditableResource<T extends object, Input extends object> extends Resource<T> {
	#update: (changes: Input) => Promise<T>;
	constructor(data: T, update: (changes: Input) => Promise<T>) {
		super(data);
		this.#update = update;
	}
	async update(changes: Input) {
		const data = succeeded(await this.#update(changes));
		const original = this.toJSON() as RecordData;
		const updated = data as RecordData;
		if (
			(original.uuid !== undefined && original.uuid !== updated.uuid) ||
			(original.id !== undefined && original.id !== updated.id)
		)
			throw new PlaybooksError(502, 'The updated resource identity did not match.');
		this.replace(data);
		return this;
	}
}
export const editable = <T extends object, Input extends object>(data: T, update: (changes: Input) => Promise<T>) =>
	new EditableResource(data, update) as EditableResource<T, Input> & Readonly<T>;
