import { PlaybooksError } from './error.js';
import type { RecordResource } from './resource.js';
import { action, get, identifier, listing, record, Resource } from './resource.js';
import { readEvents } from './sse.js';
import type { Transport } from './transport.js';
import type { ConversationForkInput, MessageResponseInput } from './types.js';
import type { ApiResponse } from './types.js';
import type { ConversationData, MessageData, RunData, RunListOptions } from './types.js';
import type { Identifier, MessageInput, MessageOptions, MessageUpdate, RecordData, StreamOptions } from './types.js';

export class Runs {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	list(options?: RunListOptions) {
		return listing<RunData>(this.#transport, this.#path, options);
	}
	get(id: Identifier) {
		return get<RunData>(this.#transport, `${this.#path}/${identifier(id)}`);
	}
	control(id: Identifier) {
		return get(this.#transport, `${this.#path}/${identifier(id)}/control`);
	}
	cancel(id: Identifier) {
		return action(this.#transport, `${this.#path}/${identifier(id)}/cancel`, 'POST');
	}
	replace(id: Identifier, input: MessageInput & { idempotencyKey: string }) {
		return action(this.#transport, `${this.#path}/${identifier(id)}/replace`, 'POST', input);
	}
	async *stream(id: Identifier, options: StreamOptions) {
		const body = await this.#transport.openStream(`${this.#path}/${identifier(id)}/stream`, options.signal);
		options.onActivity?.();
		yield* readEvents(body, options.onActivity ?? (() => {}));
	}
}

export class Messages {
	#transport: Transport;
	#path: string;
	#conversationId: Identifier;
	#sandbox: boolean;
	constructor(transport: Transport, path: string, conversationId: Identifier, sandbox: boolean) {
		this.#transport = transport;
		this.#path = path;
		this.#conversationId = conversationId;
		this.#sandbox = sandbox;
	}
	#params() {
		return this.#sandbox ? { environment: 'sandbox' } : {};
	}
	async list(options: MessageOptions = {}): Promise<ApiResponse<RecordResource<MessageData>[]>> {
		const response = await this.#transport.request(this.#path, 'GET', undefined, {
			...options,
			...this.#params(),
		});
		return {
			...response,
			data: response.data.map((data: MessageData) => record(data)),
		};
	}
	async get(id: Identifier) {
		const result = await get<MessageData>(this.#transport, `${this.#path}/${identifier(id)}`, this.#params());
		if (
			this.#sandbox &&
			(String(result.toJSON().conversationId) !== String(this.#conversationId) ||
				result.toJSON().environment !== 'sandbox')
		)
			throw new PlaybooksError(403, 'The message does not belong to this sandbox conversation.');
		return result;
	}
	async create(input: MessageInput) {
		return record<MessageData>(
			(await this.#transport.request(this.#path, 'POST', { ...input, ...this.#params() })).data,
		);
	}
	async update(id: Identifier, input: MessageUpdate) {
		if (this.#sandbox) await this.get(id);
		return record<MessageData>(
			(await this.#transport.request(`${this.#path}/${identifier(id)}`, 'PUT', input, this.#params(), false)).data,
		);
	}
	async respond(id: Identifier, input: MessageResponseInput) {
		if (this.#sandbox) await this.get(id);
		return action(this.#transport, `${this.#path}/${identifier(id)}/responses`, 'POST', input, this.#params());
	}
	async delete(id: Identifier) {
		if (this.#sandbox) await this.get(id);
		return (
			await this.#transport.request(`${this.#path}/${identifier(id)}`, 'DELETE', undefined, this.#params(), false)
		).data;
	}
}

export class Conversation extends Resource<ConversationData> {
	declare readonly id: Identifier;
	declare readonly uuid: string;
	declare readonly latestBranchId?: number;
	#transport: Transport;
	#path: string;
	#sandbox: boolean;
	constructor(transport: Transport, data: ConversationData, sandbox: boolean) {
		super(data);
		this.#transport = transport;
		this.#path = `/conversations/${identifier(data.uuid)}`;
		this.#sandbox = sandbox;
	}
	get messages() {
		if (this.#sandbox) throw new PlaybooksError(422, 'Select a conversation branch before accessing Project messages.');
		return new Messages(this.#transport, `${this.#path}/messages`, this.id, false);
	}
	get branches() {
		return {
			get: async (id: Identifier) => {
				if (!this.#sandbox) throw new PlaybooksError(422, 'Workspace Operator messages are not branch-scoped.');
				const path = `${this.#path}/branches/${identifier(id)}`;
				const response = await get(this.#transport, path);
				return new ConversationBranch(
					response.toJSON(),
					new Messages(this.#transport, `${path}/messages`, this.id, true),
				);
			},
		};
	}
}

export class Conversations {
	#transport: Transport;
	#path: string;
	#ownerId: Identifier;
	#project: boolean;
	constructor(transport: Transport, path: string, ownerId: Identifier, project: boolean) {
		this.#transport = transport;
		this.#path = path;
		this.#ownerId = ownerId;
		this.#project = project;
	}
	async #fetch(path: string, selected?: Identifier) {
		const { data } = await this.#transport.request(path, 'GET', undefined, {}, false);
		if (
			this.#project
				? String(data.projectId) !== String(this.#ownerId)
				: String(data.workspaceId) !== String(this.#ownerId) || data.projectId || data.folderId
		)
			throw new PlaybooksError(403, 'The conversation does not belong to the requested Operator.');
		if (selected !== undefined && data.uuid !== String(selected))
			throw new PlaybooksError(403, 'The conversation does not match the requested identifier.');
		return new Conversation(this.#transport, data, this.#project);
	}
	resolve() {
		return this.#fetch(`${this.#path}/conversation`);
	}
	get(id: Identifier) {
		return this.#fetch(`/conversations/${identifier(id)}`, id);
	}
}
export class ProjectConversations extends Conversations {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string, ownerId: Identifier) {
		super(transport, path, ownerId, true);
		this.#transport = transport;
		this.#path = path;
	}
	async create(input: { branchId: number }) {
		const data = await action<ConversationData>(this.#transport, `${this.#path}/conversations`, 'POST', input);
		return new Conversation(this.#transport, data, true);
	}
	async fork(id: Identifier, input: ConversationForkInput) {
		const data = await action<ConversationData>(
			this.#transport,
			`${this.#path}/conversations/${identifier(id)}/fork`,
			'POST',
			input,
		);
		return new Conversation(this.#transport, data, true);
	}
	async list(): Promise<ApiResponse<Conversation[]>> {
		const response = await this.#transport.request(`${this.#path}/conversations`, 'GET', undefined, {}, false);
		return {
			...response,
			data: response.data.map((data: RecordData) => new Conversation(this.#transport, data, true)),
		};
	}
}

export class ConversationBranch extends Resource<RecordData> {
	#messages: Messages;
	constructor(data: RecordData, messages: Messages) {
		super(data);
		this.#messages = messages;
	}
	get messages() {
		return this.#messages;
	}
}
