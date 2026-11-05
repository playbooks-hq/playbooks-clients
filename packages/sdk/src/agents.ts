import { Collection } from 'src/collection.js';
import { PlaybooksError } from 'src/error.js';
import { action, get, identifier, listing, Resource } from 'src/resource.js';
import { readEvents } from 'src/sse.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions, MessageInput, MessageOptions, StreamOptions } from 'src/types.js';

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
	conversationId?: number | null;
	name: string;
	instructions: string;
	frequency: string;
	weekday?: number;
	monthDay?: number;
	time: string;
	timezone: string;
}
export interface AgentScheduleUpdate extends Partial<AgentScheduleCreate> {
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
export class Agent extends Resource<AgentData> {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, data: AgentData) {
		super(data);
		this.#transport = transport;
		this.#path = `/agents/${identifier(data.uuid)}`;
	}
	async update(input: AgentUpdate) {
		const data = await action<AgentData>(this.#transport, this.#path, 'PATCH', input);
		if (data.uuid !== this.uuid) throw new PlaybooksError(502, 'The updated Agent identity did not match.');
		this.replace(data);
		return this;
	}
	archive(revision: number) {
		return action<AgentData>(this.#transport, `${this.#path}/archive`, 'POST', { revision });
	}
	restore(revision: number) {
		return action<AgentData>(this.#transport, `${this.#path}/restore`, 'POST', { revision });
	}
	delete(revision: number) {
		return action(this.#transport, this.#path, 'DELETE', { revision });
	}
	get executions() {
		return {
			list: (options?: Pick<ListOptions, 'page' | 'pageSize'>) =>
				listing(this.#transport, `${this.#path}/executions`, options),
			get: (id: Identifier) => get(this.#transport, `${this.#path}/executions/${identifier(id)}`),
			create: (input: { instruction: string; idempotencyKey: string }) =>
				this.#transport
					.request(
						`${this.#path}/executions`,
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
				action(this.#transport, `${this.#path}/executions/${identifier(id)}/cancel`, 'POST', {}),
		};
	}
	get conversations() {
		const path = `${this.#path}/conversations`;
		const transport = this.#transport;
		return {
			list: (options?: ListOptions) => listing(transport, path, options),
			create: (input: { title?: string; idempotencyKey: string }) =>
				transport
					.request(path, 'POST', { title: input.title }, {}, false, false, false, undefined, {
						'Idempotency-Key': input.idempotencyKey,
					})
					.then(response => response.data),
			get: (id: Identifier) => get(transport, `${path}/${identifier(id)}`),
			update: (id: Identifier, input: { title: string }) =>
				action(transport, `${path}/${identifier(id)}`, 'PATCH', input),
			archive: (id: Identifier) => action(transport, `${path}/${identifier(id)}/archive`, 'POST'),
			restore: (id: Identifier) => action(transport, `${path}/${identifier(id)}/restore`, 'POST'),
			delete: (id: Identifier) => action(transport, `${path}/${identifier(id)}`, 'DELETE'),
			markRead: (id: Identifier) => action(transport, `${path}/${identifier(id)}/read`, 'PUT'),
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
			editQueued: (id: Identifier, messageId: Identifier, input: Pick<MessageInput, 'text' | 'attachments'>) =>
				action(transport, `${path}/${identifier(id)}/messages/${identifier(messageId)}`, 'PUT', input),
			cancelQueued: (id: Identifier, messageId: Identifier) =>
				action(transport, `${path}/${identifier(id)}/messages/${identifier(messageId)}`, 'DELETE'),
			messages: (id: Identifier, options?: MessageOptions) =>
				listing(transport, `${path}/${identifier(id)}/messages`, options),
			send: (id: Identifier, input: Pick<MessageInput, 'text' | 'attachments'> & { idempotencyKey: string }) => {
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
				listing(this.#transport, `${this.#path}/schedules`, options),
			create: (input: AgentScheduleCreate) => action(this.#transport, `${this.#path}/schedules`, 'POST', input),
			update: (id: Identifier, input: AgentScheduleUpdate) =>
				action(this.#transport, `${this.#path}/schedules/${identifier(id)}`, 'PATCH', input),
		};
	}
	get usage() {
		return get(this.#transport, `${this.#path}/usage`);
	}
	get budget() {
		return {
			get: () => get(this.#transport, `${this.#path}/budget`),
			update: (input: Record<string, unknown> & { revision: number }) =>
				action(this.#transport, `${this.#path}/budget`, 'PUT', input),
		};
	}
	get credentials() {
		return {
			list: () => listing(this.#transport, `${this.#path}/credentials`),
			create: (input: { name: string; capabilities?: ('invoke' | 'content')[] }) =>
				action(this.#transport, `${this.#path}/credentials`, 'POST', input),
			revoke: (id: Identifier) => action(this.#transport, `${this.#path}/credentials/${identifier(id)}`, 'DELETE'),
		};
	}
	get grants() {
		return {
			list: () => listing(this.#transport, `${this.#path}/grants`),
			put: (input: { userId: string; capabilities: string[] }) =>
				action(this.#transport, `${this.#path}/grants`, 'PUT', input),
		};
	}
	get resources() {
		return {
			list: () => listing(this.#transport, `${this.#path}/resources`),
			options: (options?: ListOptions & { kind?: AgentResourceKind }) =>
				listing<AgentResourceOption>(this.#transport, `${this.#path}/resource-options`, options),
			put: (input: { kind: AgentResourceKind; resourceId: string }) =>
				action(this.#transport, `${this.#path}/resources`, 'PUT', input),
			delete: (kind: AgentResourceKind, resourceId: Identifier) => {
				if (!['skill', 'design', 'reference'].includes(kind))
					throw new PlaybooksError(422, 'Invalid Agent resource kind.');
				return action(this.#transport, `${this.#path}/resources/${kind}/${identifier(resourceId)}`, 'DELETE');
			},
		};
	}
	get externals() {
		return {
			list: () => listing(this.#transport, `${this.#path}/external-assignments`),
			options: (options?: ListOptions & { kind?: AgentExternalKind }) =>
				listing(this.#transport, `${this.#path}/external-options`, options),
			create: (input: AgentExternalGrant) =>
				action(this.#transport, `${this.#path}/external-assignments`, 'POST', input),
			update: (id: Identifier, input: { revision: number; operations: string[]; allowedOrigins?: string[] }) =>
				action(this.#transport, `${this.#path}/external-assignments/${identifier(id)}`, 'PUT', input),
			revoke: (id: Identifier, revision: number) =>
				action(this.#transport, `${this.#path}/external-assignments/${identifier(id)}`, 'DELETE', { revision }),
		};
	}
	get workingFiles() {
		return {
			get: () => get(this.#transport, `${this.#path}/working-files`),
			update: (input: { revision: number; files: object }) =>
				action(this.#transport, `${this.#path}/working-files`, 'PUT', input),
		};
	}
	get outputs() {
		return {
			list: () => listing(this.#transport, `${this.#path}/outputs`),
			get: (id: Identifier) => get(this.#transport, `${this.#path}/outputs/${identifier(id)}`),
		};
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
