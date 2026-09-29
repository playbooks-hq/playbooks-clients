import { action, get, identifier, listing } from './resource.js';
import type { Transport } from './transport.js';
import type { InboxCounts, InboxItem, InboxListOptions, InboxReadInput } from './types.js';

export class Inbox {
	#transport: Transport;
	constructor(transport: Transport) {
		this.#transport = transport;
	}
	list(options: InboxListOptions = {}) {
		return listing<InboxItem>(this.#transport, '/workspace/inbox', options);
	}
	count() {
		return get<InboxCounts>(this.#transport, '/workspace/inbox/count');
	}
	markRead(conversationId: string, input: InboxReadInput) {
		return action(this.#transport, `/workspace/inbox/conversations/${identifier(conversationId)}/read`, 'PUT', input);
	}
	markAllRead() {
		return action<{ read: boolean }>(this.#transport, '/workspace/inbox/read', 'PUT');
	}
}
