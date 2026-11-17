import { PlaybooksError } from 'src/error.js';
import { ConversationPlans } from 'src/file-system.js';
import type { RecordResource } from 'src/resource.js';
import { action, get, identifier, listing, record, Resource } from 'src/resource.js';
import { readEvents } from 'src/sse.js';
import type { Transport } from 'src/transport.js';
import type { ConversationForkInput, ConversationUtilityListOptions, MessageResponseInput } from 'src/types.js';
import type { ApiResponse, MarkReadInput } from 'src/types.js';
import type { ConversationData, MessageData, RunData, RunListOptions } from 'src/types.js';
import type { Identifier, MessageInput, MessageOptions, MessageUpdate, RecordData, StreamOptions } from 'src/types.js';

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
	#projectPlanPath?: string;
	constructor(transport: Transport, data: ConversationData, sandbox: boolean, projectPlanPath?: string) {
		super(data);
		this.#transport = transport;
		this.#path = `/conversations/${identifier(data.uuid)}`;
		this.#sandbox = sandbox;
		this.#projectPlanPath = projectPlanPath;
	}
	utility() {
		return get(this.#transport, `${this.#path}/utility`);
	}
	utilityItems(options: ConversationUtilityListOptions) {
		return listing(this.#transport, `${this.#path}/utility`, options);
	}
	get messages() {
		if (this.#sandbox) throw new PlaybooksError(422, 'Select a conversation branch before accessing Project messages.');
		return new Messages(this.#transport, `${this.#path}/messages`, this.id, false);
	}
	markRead(input: MarkReadInput) {
		if (this.#sandbox) throw new PlaybooksError(422, 'This operation requires a Chat conversation.');
		if (!Number.isSafeInteger(input.throughMessageId) || input.throughMessageId < 0)
			throw new PlaybooksError(422, 'Provide a nonnegative message ID.');
		return action(this.#transport, this.#path, 'PUT', {
			action: 'read',
			messageId: input.throughMessageId,
			observedAt: input.observedAt,
		});
	}
	get plans() {
		if (this.#sandbox && !this.#projectPlanPath)
			throw new PlaybooksError(422, 'Use the Project scope to access this conversation Plan.');
		return new ConversationPlans(this.#transport, `${this.#projectPlanPath ?? ''}${this.#path}/plans`);
	}
	get branches() {
		return {
			get: async (id: Identifier) => {
				if (!this.#sandbox) throw new PlaybooksError(422, 'Chat messages are not branch-scoped.');
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

export const chatConversations = (transport: Transport, workspace: string) => ({
	get: async (id: Identifier) => {
		const { data }: { data: ConversationData } = await transport.request(
			`/conversations/${identifier(id)}`,
			'GET',
			undefined,
			{},
			false,
		);
		if (data.uuid !== String(id) || data.projectId)
			throw new PlaybooksError(403, 'The conversation does not match the requested Chat conversation.');
		if (!data.source?.uuid)
			throw new PlaybooksError(403, 'Use chats.conversation(chatId) to verify the owning Workspace.');
		if (data.source.uuid !== workspace)
			throw new PlaybooksError(403, 'The conversation does not belong to the requested Workspace.');
		return new Conversation(transport, data, false);
	},
});

export class Conversations {
	#transport: Transport;
	#ownerId: Identifier;
	#project: boolean;
	#projectPlanPath?: string;
	constructor(transport: Transport, ownerId: Identifier, project: boolean, projectPlanPath?: string) {
		this.#transport = transport;
		this.#ownerId = ownerId;
		this.#project = project;
		this.#projectPlanPath = projectPlanPath;
	}
	protected wrap(data: ConversationData) {
		return new Conversation(this.#transport, data, this.#project, this.#projectPlanPath);
	}
	async #fetch(path: string, selected?: Identifier) {
		const { data } = await this.#transport.request(path, 'GET', undefined, {}, false);
		if (
			this.#project
				? String(data.projectId) !== String(this.#ownerId)
				: String(data.workspaceId) !== String(this.#ownerId) || data.projectId
		)
			throw new PlaybooksError(403, 'The conversation does not belong to the requested Operator.');
		if (selected !== undefined && data.uuid !== String(selected))
			throw new PlaybooksError(403, 'The conversation does not match the requested identifier.');
		return this.wrap(data);
	}
	get(id: Identifier) {
		return this.#fetch(`/conversations/${identifier(id)}`, id);
	}
}
export class ProjectConversations extends Conversations {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string, ownerId: Identifier, projectPlanPath = path) {
		super(transport, ownerId, true, projectPlanPath);
		this.#transport = transport;
		this.#path = path;
	}
	async create(input: { branchId: number }) {
		const data = await action<ConversationData>(this.#transport, `${this.#path}/conversations`, 'POST', input);
		return this.wrap(data);
	}
	async fork(id: Identifier, input: ConversationForkInput) {
		const data = await action<ConversationData>(
			this.#transport,
			`${this.#path}/conversations/${identifier(id)}/fork`,
			'POST',
			input,
		);
		return this.wrap(data);
	}
	async list(): Promise<ApiResponse<Conversation[]>> {
		const response = await this.#transport.request(`${this.#path}/conversations`, 'GET', undefined, {}, false);
		return {
			...response,
			data: response.data.map((data: RecordData) => this.wrap(data)),
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
