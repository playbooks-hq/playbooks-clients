import { PlaybooksError } from 'src/error.js';
import { identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { FileUpload, Identifier, ListOptions, RecordData } from 'src/types.js';

export class Files {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	list(options?: ListOptions) {
		return listing(this.#transport, this.#path, options);
	}
	async upload(input: FileUpload): Promise<RecordData> {
		const { name, expectedRevision } = input;
		if (
			!name ||
			name.includes('\\') ||
			name.startsWith('/') ||
			name.split('/').some(part => !part || part === '..' || part === '.')
		)
			throw new PlaybooksError(422, 'Provide a safe relative Agent File name.');
		const blob = input.content instanceof Blob ? input.content : new Blob([new Uint8Array(input.content)]);
		if (blob.size > 20 * 1024 * 1024) throw new PlaybooksError(422, 'Agent Files must not exceed 20 MB.');
		const form = new FormData();
		form.set('file', blob, name.split('/').pop());
		form.set('paths', JSON.stringify([name]));
		form.set('expectedRevisions', JSON.stringify({ [name]: expectedRevision ?? null }));
		return (await this.#transport.request(this.#path, 'POST', form, {}, false)).data;
	}
	download(id: Identifier): Promise<Uint8Array> {
		return this.#transport.request(`${this.#path}/${identifier(id)}/download`, 'GET', undefined, {}, true, true);
	}
}
