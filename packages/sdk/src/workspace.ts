import { Collection } from 'src/collection.js';
import { PlaybooksError } from 'src/error.js';
import { Files } from 'src/files.js';
import { Inbox } from 'src/inbox.js';
import { Conversations, Runs } from 'src/operators.js';
import { Projects } from 'src/project.js';
import { action, get, identifier, listing, Resource } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { BudgetUpdate, TemplateListOptions } from 'src/types.js';
import type { FolderData, MemberData, MemberUpdate, TemplateData, TemplateUpdate } from 'src/types.js';
import type {
	DnsRecordInput,
	Identifier,
	ListOptions,
	NamedInput,
	SettingsInput,
	WorkspaceData,
	WorkspaceUpdate,
} from 'src/types.js';

export interface Workspace extends Readonly<WorkspaceData> {
	readonly uuid: string;
}

export class Workspace extends Resource<WorkspaceData> {
	declare readonly id: number;
	declare readonly uuid: string;
	declare readonly name: string;
	#transport: Transport;
	#identity: string;
	constructor(transport: Transport, data: WorkspaceData) {
		super(data);
		this.#transport = transport;
		this.#identity = data.uuid;
	}
	async update(input: WorkspaceUpdate) {
		const data = await updateWorkspace(this.#transport, this.#identity, input);
		if (data.id !== this.id) throw new PlaybooksError(502, 'The updated Workspace identity did not match.');
		this.replace(data);
		return this;
	}
	get projects() {
		return new Projects(this.#transport);
	}
	get conversations() {
		return new Conversations(this.#transport, '', this.id, false);
	}
	get runs() {
		return new Runs(this.#transport, '/operator/runs');
	}
	get files() {
		return new Files(this.#transport, '/files');
	}
	get folders() {
		const collection = new Collection<FolderData, NamedInput>(this.#transport, '/project-folders');
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			create: (input: NamedInput) => collection.create(input),
			update: (id: Identifier, input: NamedInput) => collection.update(id, input),
		};
	}
	get templates() {
		const collection = new Collection<TemplateData, TemplateUpdate>(this.#transport, '/templates');
		return {
			list: (options?: TemplateListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			update: (id: Identifier, input: TemplateUpdate) => collection.update(id, input),
			publish: (id: Identifier) => action(this.#transport, `/templates/${identifier(id)}/publish`, 'POST', {}),
			versions: (id: Identifier, options?: ListOptions) =>
				listing(this.#transport, `/templates/${identifier(id)}/versions`, options),
		};
	}
	get members() {
		const collection = new Collection<MemberData, MemberUpdate>(this.#transport, '/workspace/members');
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			update: (id: Identifier, input: MemberUpdate) => collection.update(id, input),
			previewDeparture: (id: Identifier) =>
				get(this.#transport, `/session/workspaces/${identifier(this.#identity)}/members/${identifier(id)}/departure`),
			depart: (id: Identifier, input: { revision: string; toUserId?: number }) =>
				action(
					this.#transport,
					`/session/workspaces/${identifier(this.#identity)}/members/${identifier(id)}/departure`,
					'POST',
					input,
				),
		};
	}
	get invitations() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, '/workspace/access-invitations', options),
			create: (input: { email: string; role: string }) =>
				action(this.#transport, '/workspace/access-invitations', 'POST', input),
			revoke: (id: Identifier) => action(this.#transport, `/workspace/access-invitations/${identifier(id)}`, 'DELETE'),
		};
	}
	get settings() {
		return {
			get: () => get(this.#transport, '/workspace/preferences'),
			update: (input: SettingsInput) => action(this.#transport, '/workspace/preferences', 'PUT', input),
		};
	}
	get designs() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/designs', options) };
	}
	get skills() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/skills', options) };
	}
	get mcps() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/mcps', options) };
	}
	get connectors() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/connectors', options) };
	}
	get secrets() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/secrets', options) };
	}
	get inbox() {
		return new Inbox(this.#transport);
	}
	get activity() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/activities', options) };
	}
	get usage() {
		return { get: () => get(this.#transport, '/workspace/usage') };
	}
	get budget() {
		return {
			get: () => get(this.#transport, '/workspace/budget'),
			update: (input: BudgetUpdate) => action(this.#transport, '/workspace/budget', 'PUT', input),
		};
	}
	get credits() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/workspace/credits', options) };
	}
	get invoices() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/workspace/invoices', options) };
	}
	get settlements() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, '/workspace/settlements', options),
			get: (id: Identifier) => get(this.#transport, `/workspace/settlements/${identifier(id)}`),
		};
	}
	get transfers() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/workspace/transfers', options) };
	}
	get domains() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, '/domains', options),
			get: (id: Identifier) => get(this.#transport, `/domains/${identifier(id)}`),
			add: (input: { name: string }) => action(this.#transport, '/domains', 'POST', input),
			records: (domainId: Identifier) => {
				const path = `/domains/${identifier(domainId)}/dns-records`;
				return {
					list: (options?: ListOptions) => listing(this.#transport, path, options),
					create: (input: DnsRecordInput) => action(this.#transport, path, 'POST', input),
					update: (id: Identifier, input: DnsRecordInput) =>
						action(this.#transport, `${path}/${identifier(id)}`, 'PUT', input),
					delete: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
				};
			},
		};
	}
}

export const updateWorkspace = async (transport: Transport, id: Identifier, input: WorkspaceUpdate) => {
	const data = await action<WorkspaceData>(transport, '/workspace', 'PUT', input);
	if (data.uuid !== String(id)) throw new PlaybooksError(502, 'The updated Workspace identity did not match.');
	return data;
};
