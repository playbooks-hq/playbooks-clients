import { action, editable, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions, RecordData } from 'src/types.js';

/** Shared mechanics; callers expose only operations supported by their resource. */
export class Collection<Data extends RecordData, Input extends object, Create extends object = Input> {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	#wrap(data: Data) {
		const id = data.uuid ?? data.id;
		return editable(data, (input: Input) =>
			action<Data>(this.#transport, `${this.#path}/${identifier(id)}`, 'PUT', input),
		);
	}
	async list(options?: ListOptions) {
		const response = await listing<Data>(this.#transport, this.#path, options);
		return { ...response, data: response.data.map(item => this.#wrap(item.toJSON())) };
	}
	async get(id: Identifier, options: { include?: string } = {}) {
		return this.#wrap((await get<Data>(this.#transport, `${this.#path}/${identifier(id)}`, options)).toJSON());
	}
	async create(input: Create) {
		return this.#wrap(await action<Data>(this.#transport, this.#path, 'POST', input));
	}
	async update(id: Identifier, input: Input) {
		return this.#wrap(await action<Data>(this.#transport, `${this.#path}/${identifier(id)}`, 'PUT', input));
	}
}
