import { action, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier } from 'src/types.js';

export type ChannelProvider = 'email' | 'sms' | 'slack' | 'telegram' | 'whatsapp' | 'teams' | 'discord';

/** Resource channel assignments. Provider credentials and personal verification use secure setup. */
export class Channels {
	constructor(
		private transport: Transport,
		private path: string,
	) {}
	list() {
		return listing(this.transport, this.path);
	}
	connect(provider: ChannelProvider, workspaceConnectorId?: number) {
		return action(this.transport, `${this.path}/${provider}/connect`, 'POST', { workspaceConnectorId });
	}
	setEnabled(provider: ChannelProvider, workspaceConnectorId: number, enabled: boolean) {
		return action(this.transport, `${this.path}/${provider}/${enabled ? 'enable' : 'disable'}`, 'POST', {
			workspaceConnectorId,
		});
	}
	removeBinding(provider: ChannelProvider, bindingId: Identifier) {
		return action(this.transport, `${this.path}/${provider}/bindings/${identifier(bindingId)}`, 'DELETE');
	}
}
