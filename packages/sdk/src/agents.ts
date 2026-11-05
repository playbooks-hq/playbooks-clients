import { Channels } from 'src/channels.js';
import { Collection } from 'src/collection.js';
import { PlaybooksError } from 'src/error.js';
import { action, get, identifier, listing, Resource } from 'src/resource.js';
import { readEvents } from 'src/sse.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions, MessageInput, MessageOptions, StreamOptions } from 'src/types.js';

export interface AgentSourceSelection {
	version: string;
	conversationId: string;
}
export interface AgentComposerOptions {
	modelId?: number;
	mode?: 'plan' | 'execute';
	deliveryMode?: 'queue' | 'steer' | 'busy';
	permissions?: 'autonomous' | 'critical' | 'all';
}
export type AgentMentionTarget = {
	start: number;
	length: number;
	label: string;
	uuid?: string;
	revision?: string | number;
} & (
	| { targetType: 'skill'; skillId: number }
	| { targetType: 'design'; designId: number }
	| { targetType: 'reference'; operatorReferenceId: number }
);
export interface AgentArtifactPrepare {
	conversationId: string;
	requestId: string;
	artifactId?: string;
	expectedVersionId?: string | null;
	name: string;
	type?: string;
	source:
		| { kind: 'agent-tree'; revisionId: string; entrypoint: string; paths: string[]; routingMode?: 'files' | 'spa' }
		| { kind: 'agent-output'; outputId: string; checksum: string };
}
export interface AgentData {
	[key: string]: unknown;
	id: number;
	uuid: string;
	name: string;
	description: string | null;
	workspaceId: number;
	ownerKind: 'direct' | 'project' | 'site' | 'external';
	integrationId: string | null;
	integration?: { id: string; uuid: string; name: string; kind: string } | null;
	environment?: 'development' | 'production' | null;
	status: string;
	revision: number;
	capabilities: Record<string, boolean>;
	createdAt: string;
	updatedAt: string;
}
export interface AgentCreate {
	idempotencyKey: string;
	name: string;
	description?: string;
	integrationId?: string;
	ownerKey?: string;
	configuration?: Record<string, unknown>;
	initialCapabilities?: (
		| 'metadata'
		| 'configure'
		| 'invoke'
		| 'content'
		| 'credentials'
		| 'budgets'
		| 'lifecycle'
		| 'resources'
	)[];
}
export interface AgentUpdate {
	revision: number;
	name?: string;
	description?: string;
	configuration?: Record<string, unknown>;
}
export interface AgentScheduleCreate {
	idempotencyKey: string;
	conversationId?: number | null;
	name: string;
	instructions: string;
	frequency: string;
	weekday?: number;
	monthDay?: number;
	time: string;
	timezone: string;
}
export interface AgentScheduleUpdate extends Partial<Omit<AgentScheduleCreate, 'idempotencyKey'>> {
	revision: number;
	status?: 'enabled' | 'paused';
}
export type AgentResourceKind = 'skill' | 'design' | 'reference';
export type AgentExternalKind = 'connector' | 'mcp' | 'browser';
export interface AgentExternalGrant {
	kind: AgentExternalKind;
	sourceId?: string;
	operations: string[];
	allowedOrigins?: string[];
}
export interface AgentResourceOption {
	kind: AgentResourceKind;
	resourceId: string;
	name: string;
}
export interface AgentIntegrationFacet {
	id: string;
	name: string;
}
export interface Agent extends Readonly<AgentData> {
	readonly uuid: string;
}
/** An operation handle for a known Agent identifier; it carries no metadata snapshot. */
export class AgentReference {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, id: Identifier) {
		this.#transport = transport;
		this.#path = `/agents/${identifier(id)}`;
	}
	protected get transport() {
		return this.#transport;
	}
	protected get path() {
		return this.#path;
	}
	archive(revision: number) {
		return action<AgentData>(this.transport, `${this.path}/archive`, 'POST', { revision });
	}
	restore(revision: number) {
		return action<AgentData>(this.transport, `${this.path}/restore`, 'POST', { revision });
	}
	delete(revision: number) {
		return action(this.transport, this.path, 'DELETE', { revision });
	}
	get executions() {
		return {
			list: (options?: Pick<ListOptions, 'page' | 'pageSize'>) =>
				listing(this.transport, `${this.path}/executions`, options),
			get: (id: Identifier) => get(this.transport, `${this.path}/executions/${identifier(id)}`),
			progress: (id: Identifier, after = '0') =>
				get(this.transport, `${this.path}/executions/${identifier(id)}/progress`, { after }),
			create: (input: { instruction: string; idempotencyKey: string }) =>
				this.transport
					.request(
						`${this.path}/executions`,
						'POST',
						{ instruction: input.instruction },
						{},
						false,
						false,
						false,
						undefined,
						{ 'Idempotency-Key': input.idempotencyKey },
					)
					.then(response => response.data),
			cancel: (id: Identifier) =>
				action(this.transport, `${this.path}/executions/${identifier(id)}/cancel`, 'POST', {}),
		};
	}
	mentions(options?: { query?: string; type?: AgentResourceKind }) {
		return listing(this.transport, `${this.path}/mentions`, options);
	}
	/** Requires signed-in user authority; Agent credentials cannot manage channels. */
	get channels() {
		return new Channels(this.transport, `${this.path}/channels`);
	}
	get artifacts() {
		const path = `${this.path}/artifacts`;
		const transport = this.transport;
		return {
			list: (options?: { page?: number; search?: string }) => listing(transport, path, options),
			get: (id: Identifier, version?: string) => get(transport, `${path}/${identifier(id)}`, { version }),
			versions: (id: Identifier, options?: { page?: number }) =>
				listing(transport, `${path}/${identifier(id)}/versions`, options),
			prepare: (input: AgentArtifactPrepare) => action(transport, `${path}/prepare`, 'POST', input),
			update: (id: Identifier, input: { name?: string; description?: string; archived?: boolean }) =>
				action(transport, `${path}/${identifier(id)}`, 'PUT', input),
			export: (id: Identifier, version?: string): Promise<Buffer> =>
				transport.request(`${path}/${identifier(id)}/export`, 'GET', undefined, { version }, true, true),
			delete: (id: Identifier, confirmation: string) =>
				action(transport, `${path}/${identifier(id)}`, 'DELETE', { confirmation }),
		};
	}
	get sources() {
		const path = `${this.path}/sources`;
		const transport = this.transport;
		return {
			list: (options?: { page?: number; search?: string; type?: 'images' | 'documents' | 'data' | 'email' }) =>
				listing(transport, path, options),
			get: (id: Identifier, selection: AgentSourceSelection) => get(transport, `${path}/${identifier(id)}`, selection),
			download: (id: Identifier, selection: AgentSourceSelection): Promise<Buffer> =>
				transport.request(`${path}/${identifier(id)}/download`, 'GET', undefined, selection, true, true),
			preview: (id: Identifier, selection: AgentSourceSelection): Promise<Buffer> =>
				transport.request(`${path}/${identifier(id)}/preview`, 'GET', undefined, selection, true, true),
			rename: (id: Identifier, input: AgentSourceSelection & { expectedName: string; name: string }) =>
				action(transport, `${path}/${identifier(id)}/rename`, 'POST', input),
			duplicate: (
				id: Identifier,
				input: AgentSourceSelection & { expectedName: string; name: string; requestId: string },
			) => action(transport, `${path}/${identifier(id)}/duplicate`, 'POST', input),
			delete: (id: Identifier, input: AgentSourceSelection & { expectedName: string }) =>
				action(transport, `${path}/${identifier(id)}/delete`, 'POST', input),
		};
	}
	get conversations() {
		const path = `${this.path}/conversations`;
		const transport = this.transport;
		return {
			list: (options?: ListOptions) => listing(transport, path, options),
			create: (input: { title?: string; idempotencyKey: string }) =>
				transport
					.request(path, 'POST', { title: input.title }, {}, false, false, false, undefined, {
						'Idempotency-Key': input.idempotencyKey,
					})
					.then(response => response.data),
			get: (id: Identifier) => get(transport, `${path}/${identifier(id)}`),
			downloadAttachment: (id: Identifier, attachmentId: Identifier): Promise<Buffer> =>
				transport.request(
					`${path}/${identifier(id)}/attachments/${identifier(attachmentId)}/download`,
					'GET',
					undefined,
					{},
					true,
					true,
				),
			previewAttachment: (id: Identifier, attachmentId: Identifier): Promise<Buffer> =>
				transport.request(
					`${path}/${identifier(id)}/attachments/${identifier(attachmentId)}/preview`,
					'GET',
					undefined,
					{},
					true,
					true,
				),
			fork: (id: Identifier, input: { submissionKey: string; throughMessageId?: number }) =>
				action(transport, `${path}/${identifier(id)}/fork`, 'POST', input),
			control: (id: Identifier, executionId: Identifier) =>
				get(transport, `${path}/${identifier(id)}/executions/${identifier(executionId)}/control`),
			retry: (id: Identifier, executionId: Identifier) =>
				action(transport, `${path}/${identifier(id)}/executions/${identifier(executionId)}/retry`, 'POST'),
			continueQueue: (id: Identifier, executionId: Identifier, holdId: string) =>
				action(transport, `${path}/${identifier(id)}/executions/${identifier(executionId)}/continue`, 'POST', {
					holdId,
				}),
			update: (id: Identifier, input: { title: string }) =>
				action(transport, `${path}/${identifier(id)}`, 'PATCH', input),
			archive: (id: Identifier) => action(transport, `${path}/${identifier(id)}/archive`, 'POST'),
			restore: (id: Identifier) => action(transport, `${path}/${identifier(id)}/restore`, 'POST'),
			delete: (id: Identifier, confirmation: string) =>
				action(transport, `${path}/${identifier(id)}`, 'DELETE', { confirmation }),
			markRead: (id: Identifier, throughMessageId: number) =>
				action(transport, `${path}/${identifier(id)}/read`, 'PUT', { throughMessageId }),
			markUnread: (id: Identifier) => action(transport, `${path}/${identifier(id)}/unread`, 'PUT'),
			reorderQueue: (id: Identifier, messageIds: number[]) =>
				action(transport, `${path}/${identifier(id)}/messages/queue`, 'PUT', { messageIds }),
			queue: (id: Identifier, options?: MessageOptions) =>
				listing(transport, `${path}/${identifier(id)}/messages/queue`, options),
			steer: (id: Identifier, messageId: Identifier) =>
				action(transport, `${path}/${identifier(id)}/messages/${identifier(messageId)}/steer`, 'POST'),
			cancel: (id: Identifier, executionId: Identifier) =>
				action(transport, `${path}/${identifier(id)}/executions/${identifier(executionId)}/cancel`, 'POST'),
			answer: (
				id: Identifier,
				executionId: Identifier,
				input: { responses: Record<string, unknown>[]; idempotencyKey: string },
			) =>
				transport
					.request(
						`${path}/${identifier(id)}/executions/${identifier(executionId)}/answers`,
						'POST',
						{ responses: input.responses },
						{},
						false,
						false,
						false,
						undefined,
						{ 'Idempotency-Key': input.idempotencyKey },
					)
					.then(response => response.data),
			editQueued: (
				id: Identifier,
				messageId: Identifier,
				input: Pick<MessageInput, 'text' | 'attachments'> &
					AgentComposerOptions & { expectedEditRevision: string; targets?: AgentMentionTarget[] },
			) => action(transport, `${path}/${identifier(id)}/messages/${identifier(messageId)}`, 'PUT', input),
			cancelQueued: (id: Identifier, messageId: Identifier) =>
				action(transport, `${path}/${identifier(id)}/messages/${identifier(messageId)}`, 'DELETE'),
			messages: (id: Identifier, options?: MessageOptions) =>
				listing(transport, `${path}/${identifier(id)}/messages`, options),
			send: (
				id: Identifier,
				input: Pick<MessageInput, 'text' | 'attachments'> &
					AgentComposerOptions & {
						idempotencyKey: string;
						replaceRunId?: number;
						targets?: AgentMentionTarget[];
					},
			) => {
				const { idempotencyKey, ...message } = input;
				return transport
					.request(`${path}/${identifier(id)}/messages`, 'POST', message, {}, false, false, false, undefined, {
						'Idempotency-Key': idempotencyKey,
					})
					.then(response => response.data);
			},
			async *stream(id: Identifier, options: StreamOptions) {
				const body = await transport.openStream(`${path}/${identifier(id)}/stream`, options.signal);
				options.onActivity?.();
				yield* readEvents(body, options.onActivity ?? (() => {}));
			},
		};
	}
	get schedules() {
		return {
			list: (options?: Pick<ListOptions, 'page' | 'pageSize'>) =>
				listing(this.transport, `${this.path}/schedules`, options),
			occurrences: (id: Identifier, options?: Pick<ListOptions, 'page' | 'pageSize'>) =>
				listing(this.transport, `${this.path}/schedules/${identifier(id)}/occurrences`, options),
			create: (input: AgentScheduleCreate) => action(this.transport, `${this.path}/schedules`, 'POST', input),
			update: (id: Identifier, input: AgentScheduleUpdate) =>
				action(this.transport, `${this.path}/schedules/${identifier(id)}`, 'PATCH', input),
		};
	}
	get usage() {
		return get(this.transport, `${this.path}/usage`);
	}
	get budget() {
		return {
			get: () => get(this.transport, `${this.path}/budget`),
			update: (input: Record<string, unknown> & { revision: number }) =>
				action(this.transport, `${this.path}/budget`, 'PUT', input),
		};
	}
	get credentials() {
		return {
			list: () => listing(this.transport, `${this.path}/credentials`),
			create: (input: { name: string; capabilities?: ('invoke' | 'content')[] }) =>
				action(this.transport, `${this.path}/credentials`, 'POST', input),
			revoke: (id: Identifier) => action(this.transport, `${this.path}/credentials/${identifier(id)}`, 'DELETE'),
		};
	}
	get grants() {
		return {
			list: () => listing(this.transport, `${this.path}/grants`),
			put: (input: { userId: string; capabilities: string[] }) =>
				action(this.transport, `${this.path}/grants`, 'PUT', input),
		};
	}
	get resources() {
		return {
			list: () => listing(this.transport, `${this.path}/resources`),
			options: (options?: ListOptions & { kind?: AgentResourceKind }) =>
				listing<AgentResourceOption>(this.transport, `${this.path}/resource-options`, options),
			put: (input: { kind: AgentResourceKind; resourceId: string }) =>
				action(this.transport, `${this.path}/resources`, 'PUT', input),
			delete: (kind: AgentResourceKind, resourceId: Identifier) => {
				if (!['skill', 'design', 'reference'].includes(kind))
					throw new PlaybooksError(422, 'Invalid Agent resource kind.');
				return action(this.transport, `${this.path}/resources/${kind}/${identifier(resourceId)}`, 'DELETE');
			},
		};
	}
	get externals() {
		return {
			list: () => listing(this.transport, `${this.path}/external-assignments`),
			options: (options?: ListOptions & { kind?: AgentExternalKind }) =>
				listing(this.transport, `${this.path}/external-options`, options),
			create: (input: AgentExternalGrant) => action(this.transport, `${this.path}/external-assignments`, 'POST', input),
			update: (id: Identifier, input: { revision: number; operations: string[]; allowedOrigins?: string[] }) =>
				action(this.transport, `${this.path}/external-assignments/${identifier(id)}`, 'PUT', input),
			revoke: (id: Identifier, revision: number) =>
				action(this.transport, `${this.path}/external-assignments/${identifier(id)}`, 'DELETE', { revision }),
		};
	}
	get workingFiles() {
		return {
			get: () => get(this.transport, `${this.path}/working-files`),
			update: (input: { revision: string; files: { path: string; content?: string; kind?: 'file' | 'directory' }[] }) =>
				action(this.transport, `${this.path}/working-files`, 'PUT', input),
			preview: (input: { revision: string; path?: string; entryPoint?: string }) =>
				action(this.transport, `${this.path}/working-files/preview`, 'POST', input),
		};
	}
	get outputs() {
		return {
			list: () => listing(this.transport, `${this.path}/outputs`),
			get: (id: Identifier) => get(this.transport, `${this.path}/outputs/${identifier(id)}`),
		};
	}
}
/** A loaded Agent retains its authoritative metadata alongside the operation handle. */
export class Agent extends AgentReference {
	#snapshot: Resource<AgentData>;
	constructor(transport: Transport, data: AgentData) {
		super(transport, data.uuid);
		this.#snapshot = new Resource(data);
		this.defineFields(data);
	}
	private defineFields(data: AgentData) {
		for (const key of Object.keys(data)) {
			if (key in this || ['__proto__', 'prototype', 'constructor'].includes(key)) continue;
			Object.defineProperty(this, key, {
				enumerable: true,
				get: () => this.#snapshot.toJSON()[key],
			});
		}
	}
	toJSON(): AgentData {
		return this.#snapshot.toJSON();
	}
	async update(input: AgentUpdate) {
		const data = await action<AgentData>(this.transport, this.path, 'PATCH', input);
		if (data.uuid !== this.uuid) throw new PlaybooksError(502, 'The updated Agent identity did not match.');
		this.#snapshot = new Resource(data);
		this.defineFields(data);
		return this;
	}
}
export class Agents {
	#transport: Transport;
	#collection: Collection<AgentData, AgentUpdate, AgentCreate>;
	constructor(transport: Transport) {
		this.#transport = transport;
		this.#collection = new Collection<AgentData, AgentUpdate, AgentCreate>(transport, '/agents', 'PATCH');
	}
	get integrations() {
		return {
			list: () => listing(this.#transport, '/agent-integrations'),
			create: (input: {
				name: string;
				kind: 'project' | 'site' | 'external';
				projectId?: string;
				siteId?: string;
				externalKey?: string;
			}) => action(this.#transport, '/agent-integrations', 'POST', input),
		};
	}
	integrationFacets(options?: Pick<ListOptions, 'page' | 'pageSize'>) {
		return listing<AgentIntegrationFacet>(this.#transport, '/agents/integration-facets', options);
	}
	async list(options?: ListOptions & { integrationId?: string; environment?: string; status?: string }) {
		return listing<AgentData>(this.#transport, '/agents', options);
	}
	reference(id: Identifier) {
		return new AgentReference(this.#transport, id);
	}
	async get(id: Identifier) {
		return new Agent(this.#transport, (await this.#collection.get(id)).toJSON());
	}
	async create(input: AgentCreate) {
		return new Agent(this.#transport, (await this.#collection.create(input)).toJSON());
	}
	async update(id: Identifier, input: AgentUpdate) {
		return new Agent(this.#transport, (await this.#collection.update(id, input)).toJSON());
	}
}
