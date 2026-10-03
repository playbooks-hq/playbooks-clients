import { setTimeout as delay } from 'node:timers/promises';

import { Collection } from './collection.js';
import { PlaybooksError } from './error.js';
import { Files } from './files.js';
import { ProjectConversations, Runs } from './operators.js';
import { ProjectTests } from './project-tests.js';
import { action, get, identifier, listing, record, Resource, succeeded } from './resource.js';
import type { Transport } from './transport.js';
import type { AgentCreate } from './types.js';
import type { ApiResponse, LogData, LogOptions, PreflightData, RecordData } from './types.js';
import type { LibraryData, ReleaseData } from './types.js';
import type { AgentData, AgentUpdate, WorkflowData } from './types.js';
import type {
	ActionReceipt,
	BudgetUpdate,
	Identifier,
	LibraryInput,
	ListOptions,
	PreflightInput,
	ProjectCreate,
	ProjectData,
	ProjectGetOptions,
	ProjectListOptions,
	ProjectUpdate,
	PublishInput,
	ScheduleInput,
	SettingsInput,
	SourceInput,
	WaitOptions,
	WorkflowInput,
} from './types.js';

export interface Project extends Readonly<ProjectData> {
	readonly uuid: string;
}

export class Project extends Resource<ProjectData> {
	declare readonly id: number;
	declare readonly uuid: string;
	declare readonly name: string;
	declare readonly executionProfile?: 'application' | 'operational' | 'test';
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, data: ProjectData, path?: string) {
		super(data);
		this.#transport = transport;
		this.#path = path ?? `/projects/${identifier(data.uuid)}`;
	}
	async update(changes: ProjectUpdate) {
		const data = await action<ProjectData>(this.#transport, this.#path, 'PUT', changes);
		if (data.id !== this.id || data.uuid !== this.uuid)
			throw new PlaybooksError(502, 'The updated Project identity did not match.');
		this.replace(data);
		return this;
	}
	move(input: { folderId?: number | null }) {
		return action(this.#transport, `${this.#path}/folder`, 'PUT', input);
	}
	archive(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/archive`, 'POST', input);
	}
	restore(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/restore`, 'POST', input);
	}
	delete(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/delete`, 'POST', input);
	}
	get lifecycle() {
		return { get: () => get(this.#transport, `${this.#path}/lifecycle`) };
	}
	get publication() {
		return { get: () => get(this.#transport, `${this.#path}/publication`) };
	}
	get usage() {
		return { get: () => get(this.#transport, `${this.#path}/usage`) };
	}
	get budget() {
		return {
			get: () => get(this.#transport, `${this.#path}/budget`),
			update: (input: BudgetUpdate) => action(this.#transport, `${this.#path}/budget`, 'PUT', input),
		};
	}
	get settings() {
		return {
			get: async () => {
				const response = await this.#transport.request(`${this.#path}/preferences`, 'GET');
				return record({ ...response.data, ...response.meta });
			},
			update: async (input: SettingsInput) => {
				const response = await this.#transport.request(`${this.#path}/preferences`, 'PUT', input);
				return { ...succeeded(response.data), ...response.meta };
			},
		};
	}
	get resources() {
		return {
			get: () => get(this.#transport, `${this.#path}/resources`),
			state: () => get(this.#transport, `${this.#path}/resource-state`),
			update: (input: { revision: string; designId?: number | null; workspaceConnectorIds?: number[] }) =>
				action(this.#transport, `${this.#path}/resources`, 'PUT', input),
		};
	}
	get collaborators() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/collaborators`, options),
			add: (input: { userId: number; role: string }) =>
				action(this.#transport, `${this.#path}/collaborators`, 'POST', input),
			update: (id: Identifier, input: { role: string }) =>
				action(this.#transport, `${this.#path}/collaborators/${identifier(id)}`, 'PUT', input),
		};
	}
	get agents() {
		const collection = new Collection<AgentData, AgentUpdate, AgentCreate>(this.#transport, `${this.#path}/agents`);
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			create: (input: AgentCreate) => collection.create(input),
			update: (id: Identifier, input: AgentUpdate) => collection.update(id, input),
		};
	}
	get tests() {
		return new ProjectTests(this.#transport, `${this.#path}/tests`);
	}
	#library(kind: 'designs' | 'skills') {
		const collection = new Collection<LibraryData, LibraryInput>(
			this.#transport,
			`${this.#path}/resources/library/${kind}`,
		);
		return {
			list: (options?: ListOptions) => collection.list(options),
			create: (input: LibraryInput) => collection.create(input),
			update: (id: Identifier, input: LibraryInput) => collection.update(id, input),
		};
	}

	get designs() {
		return this.#library('designs');
	}
	get skills() {
		return this.#library('skills');
	}
	get mcps() {
		return { list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/resource-mcps`, options) };
	}
	get connectors() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/connectors`, options),
		};
	}
	get files() {
		return new Files(this.#transport, `${this.#path}/files`);
	}
	get conversations() {
		return new ProjectConversations(this.#transport, this.#path, this.id);
	}
	get runs() {
		return new Runs(this.#transport, `${this.#path}/operator/runs`);
	}
	get sandbox() {
		return {
			get: () =>
				get(this.#transport, `${this.#path}/sandbox/${this.executionProfile === 'test' ? 'health' : 'config'}`),
		};
	}
	get logs() {
		return {
			list: (options: LogOptions = {}): Promise<ApiResponse<LogData[]>> =>
				this.#transport.request(`${this.#path}/logs`, 'GET', undefined, options),
		};
	}
	get source() {
		return {
			status: () => get(this.#transport, `${this.#path}/git-panel`),
			connect: (input: SourceInput) => action(this.#transport, `${this.#path}/source-control/connect`, 'PUT', input),
			disconnect: async (): Promise<RecordData> =>
				(await this.#transport.request(`${this.#path}/source-control/disconnect`, 'GET', undefined, {}, false)).data,
			sync: (input: { branchId: number; expectedHead: string }) =>
				action(this.#transport, `${this.#path}/git-panel/sync`, 'POST', input),
			import: async (input: { content: Blob | Uint8Array; name: string }): Promise<RecordData> => {
				const form = new FormData();
				form.set(
					'project',
					input.content instanceof Blob ? input.content : new Blob([new Uint8Array(input.content)]),
					input.name,
				);
				return (await this.#transport.request(`${this.#path}/upload`, 'POST', form, {}, false)).data;
			},
			export: (): Promise<Uint8Array> =>
				this.#transport.request(`${this.#path}/download`, 'GET', undefined, {}, false, true),
		};
	}
	get branches() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/branches`, options),
			create: (input: { name?: string; branchId?: number; baseBranch?: string }) =>
				action(this.#transport, `${this.#path}/git-panel/branches`, 'POST', input),
		};
	}
	get checkpoints() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/checkpoints`, options),
			rename: (id: Identifier, input: { label: string }) =>
				action(this.#transport, `${this.#path}/checkpoints/${identifier(id)}`, 'PUT', input),
			restore: (id: Identifier) =>
				action(this.#transport, `${this.#path}/checkpoints/${identifier(id)}/restore`, 'POST'),
		};
	}
	get ownership() {
		return {
			get: () => get(this.#transport, `${this.#path}/ownership-request`),
			transfer: (input: { toUserId: number }) =>
				action(this.#transport, `${this.#path}/ownership-request`, 'POST', input),
			accept: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/accept`, 'POST'),
			decline: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/decline`, 'POST'),
			cancel: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/cancel`, 'POST'),
		};
	}
	get workflows() {
		const collection = new Collection<WorkflowData, WorkflowInput>(this.#transport, `${this.#path}/workflows`);
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			create: (input: WorkflowInput) => collection.create(input),
			update: (id: Identifier, input: WorkflowInput) => collection.update(id, input),
			schedule: (id: Identifier, input: ScheduleInput) =>
				action(this.#transport, `${this.#path}/workflows/${identifier(id)}/schedule`, 'PUT', input),
			run: (id: Identifier) => action(this.#transport, `${this.#path}/workflows/${identifier(id)}/runs`, 'POST'),
		};
	}
	async #deployPath() {
		const { data } = await this.#transport.request(this.#path, 'GET', undefined, { include: 'deploy' });
		if (!data.deploy?.uuid)
			throw new PlaybooksError(422, 'Configure Production for this Project in Playbooks before publishing.');
		return `/deploys/${identifier(data.deploy.uuid)}/release`;
	}
	async preflight(input: PreflightInput = {}): Promise<PreflightData> {
		return (
			await this.#transport.request(`${await this.#deployPath()}/preflight`, 'POST', input, {}, false, false, true)
		).data;
	}
	async publish(input: PublishInput) {
		if (!input.expectedRevision)
			throw new PlaybooksError(422, 'Review preflight and provide expectedRevision before publishing.');
		return (await this.#transport.request(await this.#deployPath(), 'POST', input, {}, false)).data as ReleaseData;
	}
	get releases() {
		return {
			list: (options: ListOptions = {}) => {
				const { query, ...params } = options;
				return listing<ReleaseData>(this.#transport, `${this.#path}/releases`, {
					...params,
					...(query === undefined ? {} : { search: query }),
				});
			},
			get: (id: Identifier) => get<ReleaseData>(this.#transport, `${this.#path}/releases/${identifier(id)}`),
			rollback: (id: Identifier, input: { currentReleaseId: Identifier }) =>
				action(this.#transport, `${this.#path}/releases/${identifier(id)}/rollback`, 'POST', input),
			wait: async (id: Identifier, options: WaitOptions = {}) => {
				const deadline = Date.now() + (options.timeoutMs ?? 300000);
				for (;;) {
					const result = await this.#transport.request(
						`${this.#path}/releases/${identifier(id)}`,
						'GET',
						undefined,
						{},
						true,
						false,
						false,
						options.signal,
					);
					if (!['pending', 'draft'].includes(result.data.status)) {
						if (result.data.status !== 'succeeded')
							throw new PlaybooksError(
								422,
								'Publication did not succeed. Inspect the release for failure details.',
								'release',
								String(id),
							);
						return record<ReleaseData>(result.data);
					}
					if (Date.now() >= deadline)
						throw new PlaybooksError(
							408,
							'Publication is still pending. Inspect the release to resume observation.',
							'release',
							String(id),
						);
					await delay(2000, undefined, { signal: options.signal });
				}
			},
		};
	}
}

export class Projects {
	#transport: Transport;
	constructor(transport: Transport) {
		this.#transport = transport;
	}
	async list(options: ProjectListOptions = {}) {
		const response = await listing<ProjectData>(this.#transport, '/projects', options);
		return { ...response, data: response.data.map(item => new Project(this.#transport, item.toJSON())) };
	}
	async get(id: Identifier, options: ProjectGetOptions = {}) {
		const { agentId, testId, ...params } = options;
		if (agentId !== undefined && testId !== undefined)
			throw new PlaybooksError(422, 'Choose either an Agent or a Test.');
		let path = `/projects/${identifier(id)}`;
		if (agentId !== undefined) path += `/agents/${identifier(agentId)}/execution`;
		if (testId !== undefined) path += `/tests/${identifier(testId)}/execution`;
		const { data } = await this.#transport.request(path, 'GET', undefined, params);
		const childId = agentId ?? testId;
		const matches =
			childId === undefined
				? data.uuid === String(id)
				: data.childContext?.parentId === String(id) &&
					data.executionProfile === (agentId !== undefined ? 'operational' : 'test') &&
					data.childContext?.[agentId !== undefined ? 'agentId' : 'testId'] === String(childId);
		if (!matches) throw new PlaybooksError(502, 'The Project identity did not match.');
		return new Project(this.#transport, data, path);
	}
	async create(input: ProjectCreate) {
		return new Project(this.#transport, await action(this.#transport, '/projects', 'POST', input));
	}
	async update(id: Identifier, input: ProjectUpdate) {
		return new Project(this.#transport, await updateProject(this.#transport, id, input));
	}
}

const updateProject = async (transport: Transport, id: Identifier, changes: ProjectUpdate) => {
	const data = await action<ProjectData>(transport, `/projects/${identifier(id)}`, 'PUT', changes);
	if (data.uuid !== String(id)) throw new PlaybooksError(502, 'The updated Project identity did not match.');
	return data;
};
