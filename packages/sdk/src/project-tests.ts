import { action, get, identifier } from './resource.js';
import type { Transport } from './transport.js';
import type { Identifier, ProjectTestAction, ProjectTestActionInput, ProjectTestCreate } from './types.js';

/** Management receipts retain Test, operation, evidence and admission metadata. */
export class ProjectTests {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	list(options: { testId?: string; search?: string; before?: number } = {}) {
		return get(this.#transport, this.#path, options);
	}
	get(id: Identifier) {
		return get(this.#transport, `${this.#path}/${identifier(id)}`);
	}
	create(input: ProjectTestCreate) {
		return action(this.#transport, this.#path, 'POST', input);
	}
	operation(id: Identifier, operationId: Identifier) {
		return get(this.#transport, `${this.#path}/${identifier(id)}/operations/${identifier(operationId)}`);
	}
	action(id: Identifier, name: ProjectTestAction, input: ProjectTestActionInput) {
		return action(this.#transport, `${this.#path}/${identifier(id)}/${identifier(name)}`, 'POST', input);
	}
}
