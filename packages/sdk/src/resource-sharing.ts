import { PlaybooksError } from 'src/error.js';
import { action, get, identifier } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ResourceRole, ResourceVisibility } from 'src/types.js';

export class ResourceSharing {
	#path: string;
	constructor(
		private transport: Transport,
		private kind: 'chats' | 'agents' | 'projects',
		id: Identifier,
	) {
		this.#path = `/${kind}/${identifier(id)}`;
	}
	setVisibility(input: { visibility: ResourceVisibility; revision: number }) {
		return action(this.transport, `${this.#path}/visibility`, 'PATCH', input);
	}
	get invitations() {
		const path = `${this.#path}/access-invitations`;
		return {
			list: () => get(this.transport, path),
			create: (input: { email: string; role: ResourceRole }) => action(this.transport, path, 'POST', input),
			resend: (id: Identifier) => action(this.transport, `${path}/${identifier(id)}/resend`, 'POST'),
			revoke: (id: Identifier) => action(this.transport, `${path}/${identifier(id)}`, 'DELETE'),
		};
	}

	members() {
		return get(this.transport, `${this.#path}/${this.kind === 'projects' ? 'collaborators' : 'members'}`);
	}
	grant(id: Identifier, role: ResourceRole) {
		if (this.kind === 'projects') {
			const userId = Number(id);
			if (!Number.isSafeInteger(userId) || userId < 1)
				throw new PlaybooksError(422, 'Project grants require a numeric User ID.');
			return action(this.transport, `${this.#path}/collaborators`, 'POST', { userId, role });
		}
		return action(this.transport, `${this.#path}/members/${identifier(id)}`, 'PUT', { role });
	}
	updateGrant(id: Identifier, role: ResourceRole) {
		return action(
			this.transport,
			`${this.#path}/${this.kind === 'projects' ? 'collaborators' : 'members'}/${identifier(id)}`,
			'PUT',
			{ role },
		);
	}
	revoke(id: Identifier) {
		return action(
			this.transport,
			`${this.#path}/${this.kind === 'projects' ? 'collaborators' : 'members'}/${identifier(id)}`,
			'DELETE',
		);
	}
}
