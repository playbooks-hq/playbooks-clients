import { Agents } from 'src/agents.js';
import { Collection } from 'src/collection.js';
import { PlaybooksError } from 'src/error.js';
import { ConversationPlans, FileSystem } from 'src/file-system.js';
import { Files } from 'src/files.js';
import { Inbox } from 'src/inbox.js';
import { Conversations, Runs } from 'src/operators.js';
import { Projects } from 'src/project.js';
import { action, get, identifier, listing, record, Resource } from 'src/resource.js';
import type { SiteData } from 'src/sites.js';
import { Sites } from 'src/sites.js';
import { Subagents } from 'src/subagents.js';
import type { Transport } from 'src/transport.js';
import type {
	BudgetUpdate,
	TemplateListOptions,
	TemplatePublish,
	TemplateRemixResult,
	TemplateSourceReview,
} from 'src/types.js';
import type { MemberData, MemberUpdate, TemplateData, TemplateUpdate } from 'src/types.js';
import type {
	ChatCreate,
	ChatData,
	ChatScheduleCreate,
	ChatScheduleMutation,
	ChatScheduleTiming,
	ChatTemplateImport,
	ChatTemplateImportResult,
	ChatTemplateSetup,
	ChatTemplateSetupItem,
	ChatUpdate,
	DnsRecordInput,
	Identifier,
	ListOptions,
	SettingsInput,
	TemplateMaterials,
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
	get agents() {
		return new Agents(this.#transport);
	}
	get projects() {
		return new Projects(this.#transport);
	}
	get sites() {
		return new Sites(this.#transport);
	}
	get conversations() {
		return new Conversations(this.#transport, this.id, false);
	}
	get runs() {
		return new Runs(this.#transport, '/chats/runs');
	}
	get chats() {
		return chats(this.#transport);
	}

	conversationPlans(conversationId: Identifier, projectId?: Identifier) {
		return new ConversationPlans(
			this.#transport,
			`${projectId ? `/projects/${identifier(projectId)}` : ''}/conversations/${identifier(conversationId)}/plans`,
		);
	}
	get chatSchedules() {
		const path = '/chats/schedules';
		return {
			list: async () => {
				const response = await this.#transport.request(path, 'GET');
				return { ...response, data: response.data.map(record) };
			},
			get: (id: Identifier) => get(this.#transport, `${path}/${identifier(id)}`),
			preview: (input: ChatScheduleTiming) => action(this.#transport, `${path}/preview`, 'POST', input),
			create: (input: ChatScheduleCreate) => action(this.#transport, path, 'POST', input),
			update: (id: Identifier, input: ChatScheduleMutation) =>
				action(this.#transport, `${path}/${identifier(id)}`, 'PUT', input),
		};
	}
	get files() {
		return new Files(this.#transport, '/files');
	}
	get templates() {
		const collection = new Collection<TemplateData, TemplateUpdate>(this.#transport, '/templates', 'PATCH');
		return {
			createFromChat: (chatId: Identifier) =>
				action<TemplateData>(this.#transport, `/chats/${identifier(chatId)}/template`, 'POST', {}),
			draftFromChat: async (chatId: Identifier): Promise<TemplateData | null> =>
				(await get<TemplateData>(this.#transport, `/chats/${identifier(chatId)}/template`)) || null,
			createFromProject: (projectId: Identifier) =>
				action<TemplateData>(this.#transport, `/projects/${identifier(projectId)}/template`, 'POST', {}),
			draftFromProject: async (projectId: Identifier): Promise<TemplateData | null> =>
				(await get<TemplateData>(this.#transport, `/projects/${identifier(projectId)}/template`)) || null,
			createFromAgent: (agentId: Identifier) =>
				action<TemplateData>(this.#transport, `/agents/${identifier(agentId)}/template`, 'POST', {}),
			draftFromAgent: async (agentId: Identifier): Promise<TemplateData | null> =>
				(await get<TemplateData>(this.#transport, `/agents/${identifier(agentId)}/template`)) || null,
			list: (options?: TemplateListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			update: (id: Identifier, input: TemplateUpdate) => collection.update(id, input),
			publish: (id: Identifier, input: TemplatePublish) =>
				action(this.#transport, `/templates/${identifier(id)}/publish`, 'POST', input),
			source: (id: Identifier) => get<TemplateSourceReview>(this.#transport, `/templates/${identifier(id)}/source`),
			materials: (id: Identifier) => get<TemplateMaterials>(this.#transport, `/templates/${identifier(id)}/materials`),
			remix: (id: Identifier, input: { versionId: string; idempotencyKey: string; name?: string }) =>
				action<TemplateRemixResult>(this.#transport, `/explore/templates/${identifier(id)}/remix`, 'POST', input),
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
			depart: (id: Identifier, input: { revision: string }) =>
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
		return { list: (options?: ListOptions) => listing(this.#transport, '/workspace/designs', options) };
	}
	get skills() {
		return { list: (options?: ListOptions) => listing(this.#transport, '/workspace/skills', options) };
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

export const chats = (transport: Transport) => {
	const path = '/chats';
	return {
		subagents: (id: Identifier) => new Subagents(transport, `${path}/${identifier(id)}/subagents`),
		sites: (id: Identifier) => listing<SiteData>(transport, `${path}/${identifier(id)}/sites`),
		list: (options?: ListOptions & { archived?: boolean }) => listing<ChatData>(transport, path, options),
		get: (id: Identifier) => get<ChatData>(transport, `${path}/${identifier(id)}`),
		templateSetup: (id: Identifier) => get<ChatTemplateSetup>(transport, `${path}/${identifier(id)}/template-setup`),
		templateSetupItem: (id: Identifier, category: ChatTemplateSetupItem['category'], key: string) => {
			if (!key) throw new PlaybooksError(422, 'Provide a Template package key.');
			return get<ChatTemplateSetupItem>(
				transport,
				`${path}/${identifier(id)}/template-setup/items/${category}/${encodeURIComponent(key)}`,
			);
		},
		importTemplateResources: (id: Identifier, input: ChatTemplateImport) =>
			action<ChatTemplateImportResult>(transport, `${path}/${identifier(id)}/template-setup/import`, 'POST', input),
		create: (input: ChatCreate) => action<ChatData>(transport, path, 'POST', input),
		update: (id: Identifier, input: ChatUpdate) =>
			action<ChatData>(transport, `${path}/${identifier(id)}`, input.action === 'delete' ? 'DELETE' : 'PUT', input),
		fileSystem: (id: Identifier) => new FileSystem(transport, `${path}/${identifier(id)}/file-system`),
	};
};
