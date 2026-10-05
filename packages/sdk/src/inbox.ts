import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { InboxCounts, InboxItem, InboxListOptions, InboxReadInput } from 'src/types.js';

export class Inbox {
	#transport: Transport;
	constructor(transport: Transport) {
		this.#transport = transport;
	}
	list(options: InboxListOptions = {}) {
		return listing<InboxItem>(this.#transport, '/inbox', options);
	}
	count() {
		return get<InboxCounts>(this.#transport, '/inbox/count');
	}
	markRead(conversationId: string, input: InboxReadInput) {
		return action(this.#transport, `/inbox/conversations/${identifier(conversationId)}/read`, 'PUT', input);
	}
	markAllRead() {
		return action<{ read: boolean }>(this.#transport, '/inbox/read', 'PUT');
	}
}
